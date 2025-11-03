import { db } from "../db/client.js";
import { streaks, badges, userBadges, streakHistory } from "../schema/schema.js";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import logger from "../utils/logger.js";

// Helper function to check if two dates are consecutive days
const areConsecutiveDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Helper function to check if dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

// Get current user's streak data
export const getMyStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    let [userStreak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.user_id, userId))
      .limit(1);

    // If no streak record exists, create one
    if (!userStreak) {
      const [newStreak] = await db
        .insert(streaks)
        .values({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          total_active_days: 0,
        })
        .returning();
      
      userStreak = newStreak;
    }

    res.status(200).json({ streak: userStreak });
  } catch (err) {
    console.error("Error fetching streak:", err);
    res.status(500).json({ error: "Failed to fetch streak data" });
  }
};

// Update streak when user is active
export const updateStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create user streak
    let [userStreak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.user_id, userId))
      .limit(1);

    if (!userStreak) {
      const [newStreak] = await db
        .insert(streaks)
        .values({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_active_days: 1,
        })
        .returning();

      // Record activity in history
      await db.insert(streakHistory).values({
        user_id: userId,
        activity_date: today,
      });

      // Check for new badges
      const newBadges = await checkAndAwardBadges(userId, 1);

      logger.info(`Streak started for user ${userId}`);
      return res.status(200).json({ 
        streak: newStreak, 
        newBadges,
        message: "Streak started!" 
      });
    }

    const lastActivity = userStreak.last_activity_date ? new Date(userStreak.last_activity_date) : null;

    // If already active today, just return current data
    if (lastActivity && isSameDay(lastActivity, today)) {
      return res.status(200).json({ 
        streak: userStreak, 
        newBadges: [],
        message: "Already active today" 
      });
    }

    let newCurrentStreak = userStreak.current_streak;
    let freezeUsed = userStreak.freeze_used;

    if (lastActivity) {
      const daysDiff = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increase streak
        newCurrentStreak += 1;
        freezeUsed = false; // Reset freeze
      } else if (daysDiff === 2 && !freezeUsed) {
        // Missed one day but can use freeze
        newCurrentStreak += 1;
        freezeUsed = true;
      } else {
        // Streak broken - reset
        newCurrentStreak = 1;
        freezeUsed = false;
      }
    } else {
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(newCurrentStreak, userStreak.longest_streak);
    const newTotalActiveDays = userStreak.total_active_days + 1;

    // Update streak
    const [updatedStreak] = await db
      .update(streaks)
      .set({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        freeze_used: freezeUsed,
        total_active_days: newTotalActiveDays,
        updated_at: new Date(),
      })
      .where(eq(streaks.user_id, userId))
      .returning();

    // Record activity in history
    await db.insert(streakHistory).values({
      user_id: userId,
      activity_date: today,
    });

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId, newCurrentStreak);

    logger.info(`Streak updated for user ${userId}: ${newCurrentStreak} days`);
    
    res.status(200).json({ 
      streak: updatedStreak, 
      newBadges,
      message: newBadges.length > 0 ? "New badge(s) earned!" : "Streak updated!" 
    });
  } catch (err) {
    console.error("Error updating streak:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
};

// Check and award badges based on streak milestones
const checkAndAwardBadges = async (userId, currentStreak) => {
  try {
    // Get all badges that should be earned based on current streak
    const eligibleBadges = await db
      .select()
      .from(badges)
      .where(sql`${badges.milestone_days} <= ${currentStreak}`);

    // Get badges user already has
    const existingUserBadges = await db
      .select({ badge_id: userBadges.badge_id })
      .from(userBadges)
      .where(eq(userBadges.user_id, userId));

    const existingBadgeIds = new Set(existingUserBadges.map(ub => ub.badge_id));

    // Find new badges to award
    const newBadges = eligibleBadges.filter(badge => !existingBadgeIds.has(badge.id));

    // Award new badges
    if (newBadges.length > 0) {
      await db.insert(userBadges).values(
        newBadges.map(badge => ({
          user_id: userId,
          badge_id: badge.id,
          is_new: true,
        }))
      );
    }

    return newBadges;
  } catch (err) {
    console.error("Error checking badges:", err);
    return [];
  }
};

// Get all available badges
export const getAllBadges = async (req, res) => {
  try {
    const allBadges = await db
      .select()
      .from(badges)
      .orderBy(badges.milestone_days);

    res.status(200).json({ badges: allBadges });
  } catch (err) {
    console.error("Error fetching badges:", err);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
};

// Get user's earned badges
export const getMyBadges = async (req, res) => {
  try {
    const userId = req.user.id;

    const earnedBadges = await db
      .select({
        id: userBadges.id,
        badge_id: badges.id,
        name: badges.badge_name,
        description: badges.description,
        milestone_days: badges.milestone_days,
        icon_emoji: badges.badge_shape,
        color: badges.animation_type,
        earned_at: userBadges.earned_at,
        is_new: userBadges.is_new,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badge_id, badges.id))
      .where(eq(userBadges.user_id, userId))
      .orderBy(desc(userBadges.earned_at));

    res.status(200).json({ badges: earnedBadges });
  } catch (err) {
    console.error("Error fetching user badges:", err);
    res.status(500).json({ error: "Failed to fetch your badges" });
  }
};

// Mark badge as seen (remove "new" flag)
export const markBadgeAsSeen = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user.id;

    await db
      .update(userBadges)
      .set({ is_new: false })
      .where(
        and(
          eq(userBadges.user_id, userId),
          eq(userBadges.badge_id, parseInt(badgeId))
        )
      );

    res.status(200).json({ message: "Badge marked as seen" });
  } catch (err) {
    console.error("Error marking badge as seen:", err);
    res.status(500).json({ error: "Failed to update badge" });
  }
};

// Get streak history for calendar view
export const getStreakHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 90 } = req.query; // Default to last 90 days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const history = await db
      .select()
      .from(streakHistory)
      .where(
        and(
          eq(streakHistory.user_id, userId),
          gte(streakHistory.activity_date, daysAgo)
        )
      )
      .orderBy(desc(streakHistory.activity_date));

    // Format data for calendar
    const calendarData = history.map(h => ({
      date: new Date(h.activity_date).toISOString().split('T')[0],
      active: true,
    }));

    res.status(200).json({ history: calendarData });
  } catch (err) {
    console.error("Error fetching streak history:", err);
    res.status(500).json({ error: "Failed to fetch streak history" });
  }
};

// Initialize default badges (run once)
export const initializeBadges = async (req, res) => {
  try {
    const defaultBadges = [
      { badge_name: "First Step", description: "Started your learning journey!", milestone_days: 1, badge_shape: "🔥", animation_type: "#FF6B6B" },
      { badge_name: "Week Warrior", description: "7 days of consistent learning", milestone_days: 7, badge_shape: "⭐", animation_type: "#4ECDC4" },
      { badge_name: "Consistency Champion", description: "14 days streak achieved", milestone_days: 14, badge_shape: "💎", animation_type: "#45B7D1" },
      { badge_name: "Habit Former", description: "21 days of dedication", milestone_days: 21, badge_shape: "🏆", animation_type: "#FFA07A" },
      { badge_name: "Monthly Master", description: "30 days of continuous learning", milestone_days: 30, badge_shape: "🚀", animation_type: "#98D8C8" },
      { badge_name: "Learning Legend", description: "60 days of unwavering commitment", milestone_days: 60, badge_shape: "🌟", animation_type: "#FFD700" },
      { badge_name: "Dedication King", description: "90 days of excellence", milestone_days: 90, badge_shape: "👑", animation_type: "#9B59B6" },
      { badge_name: "Century Club", description: "100 days of mastery", milestone_days: 100, badge_shape: "💯", animation_type: "#E74C3C" },
      { badge_name: "Half Year Hero", description: "180 days of perseverance", milestone_days: 180, badge_shape: "🦸", animation_type: "#3498DB" },
      { badge_name: "Annual Achiever", description: "365 days of dedication!", milestone_days: 365, badge_shape: "🎓", animation_type: "#F39C12" },
    ];

    // Check if badges already exist
    const existingBadges = await db.select().from(badges);
    
    if (existingBadges.length === 0) {
      await db.insert(badges).values(defaultBadges);
      logger.info("Default badges initialized");
      res.status(201).json({ message: "Badges initialized successfully", count: defaultBadges.length });
    } else {
      res.status(200).json({ message: "Badges already initialized", count: existingBadges.length });
    }
  } catch (err) {
    console.error("Error initializing badges:", err);
    res.status(500).json({ error: "Failed to initialize badges" });
  }
};

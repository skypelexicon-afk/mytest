import { db } from "./db/client.js";
import { badges } from "./schema/schema.js";

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

async function initializeBadges() {
  try {
    console.log("Initializing badges...");
    
    // Check if badges already exist
    const existingBadges = await db.select().from(badges);
    
    if (existingBadges.length === 0) {
      await db.insert(badges).values(defaultBadges);
      console.log(`✓ Successfully initialized ${defaultBadges.length} badges`);
    } else {
      console.log(`✓ Badges already initialized (${existingBadges.length} badges found)`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error initializing badges:", err);
    process.exit(1);
  }
}

initializeBadges();

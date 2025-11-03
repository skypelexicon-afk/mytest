import { db } from './db/client.js';
import { streaks, badges, userBadges, streakHistory } from './schema/schema.js';
import { eq, sql } from 'drizzle-orm';

async function testStreakAndBadgeSystem() {
  console.log('=== Testing Streak & Badge System ===\n');
  
  // Test 1: Check if all badges are properly initialized
  console.log('1. Checking badges table:');
  const allBadges = await db.select().from(badges);
  console.log(`✓ Found ${allBadges.length} badges`);
  console.log(`  Sample badge: ${allBadges[0].badge_name} - ${allBadges[0].badge_shape} ${allBadges[0].animation_type}`);
  
  // Test 2: Check user streaks
  console.log('\n2. Checking user streaks:');
  const allStreaks = await db.select().from(streaks);
  console.log(`✓ Found ${allStreaks.length} users with streaks`);
  for (const streak of allStreaks) {
    console.log(`  User ${streak.user_id}: ${streak.current_streak} day streak`);
  }
  
  // Test 3: Check earned badges
  console.log('\n3. Checking earned badges:');
  const earnedBadges = await db
    .select({
      user_id: userBadges.user_id,
      badge_name: badges.badge_name,
      is_new: userBadges.is_new,
      earned_at: userBadges.earned_at,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badge_id, badges.id));
  console.log(`✓ Found ${earnedBadges.length} earned badges`);
  for (const badge of earnedBadges) {
    console.log(`  User ${badge.user_id}: ${badge.badge_name} ${badge.is_new ? '(NEW)' : ''}`);
  }
  
  // Test 4: Check streak history
  console.log('\n4. Checking streak history:');
  const history = await db.select().from(streakHistory);
  console.log(`✓ Found ${history.length} activity records`);
  
  // Test 5: Verify badge awarding logic
  console.log('\n5. Testing badge awarding logic:');
  const testUserId = 1330;
  const userStreak = await db
    .select()
    .from(streaks)
    .where(eq(streaks.user_id, testUserId))
    .limit(1);
  
  if (userStreak.length > 0) {
    const currentStreak = userStreak[0].current_streak;
    console.log(`  Test user ${testUserId} has ${currentStreak} day streak`);
    
    // Check eligible badges
    const eligibleBadges = await db
      .select()
      .from(badges)
      .where(sql`${badges.milestone_days} <= ${currentStreak}`);
    console.log(`  ✓ Eligible for ${eligibleBadges.length} badge(s)`);
    
    // Check earned badges
    const userBadges_earned = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.user_id, testUserId));
    console.log(`  ✓ Already earned ${userBadges_earned.length} badge(s)`);
    
    const shouldHave = eligibleBadges.length;
    const has = userBadges_earned.length;
    if (shouldHave === has) {
      console.log('  ✓ Badge awarding is working correctly!');
    } else {
      console.log(`  ⚠ Warning: User should have ${shouldHave} badges but has ${has}`);
    }
  }
  
  console.log('\n=== All Tests Complete ===\n');
  
  // Summary
  console.log('Summary:');
  console.log(`- ${allBadges.length} badges configured`);
  console.log(`- ${allStreaks.length} users with active streaks`);
  console.log(`- ${earnedBadges.length} total badges earned`);
  console.log(`- ${history.length} activity records`);
  
  process.exit(0);
}

testStreakAndBadgeSystem().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

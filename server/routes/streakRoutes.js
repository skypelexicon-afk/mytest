import express from "express";
import auth from "../middlewares/auth.js";
import {
  getMyStreak,
  updateStreak,
  getAllBadges,
  getMyBadges,
  markBadgeAsSeen,
  getStreakHistory,
  initializeBadges,
} from "../controllers/streakController.js";

const router = express.Router();

// Streak routes
router.get("/my-streak", auth, getMyStreak);
router.post("/update", auth, updateStreak);
router.get("/history", auth, getStreakHistory);

// Badge routes
router.get("/badges", auth, getAllBadges);
router.get("/my-badges", auth, getMyBadges);
router.patch("/badges/:badgeId/seen", auth, markBadgeAsSeen);

// Admin: Initialize badges (run once)
router.post("/initialize-badges", auth, initializeBadges);

export default router;

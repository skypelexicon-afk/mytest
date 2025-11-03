import express from "express";
import {
  getPublishedTests,
  getMyAttempts,
  getTestInstructions,
  startExamSession,
  saveAnswer,
  submitExam,
  getExamResult,
  getOngoingSession,
  getSessionDetails,
} from "../controllers/examSessionController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all published tests (for students)
router.get("/published-tests", getPublishedTests);

// Get my exam attempts
router.get("/my-attempts", getMyAttempts);

// Get test instructions before starting
router.get("/test/:testId/instructions", getTestInstructions);

// Check for ongoing session
router.get("/test/:testId/ongoing", getOngoingSession);

// Get session details by session ID
router.get("/session/:sessionId/details", getSessionDetails);

// Start exam session
router.post("/start", startExamSession);

// Save answer during exam
router.put("/session/:sessionId/save-answer", saveAnswer);

// Submit exam
router.post("/session/:sessionId/submit", submitExam);

// Get exam result
router.get("/session/:sessionId/result", getExamResult);

export default router;

import express from "express";
import {
  addQuestion,
  getQuestionsByTest,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../controllers/questionController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Question CRUD operations
router.post("/add", addQuestion);
router.get("/test/:testId", getQuestionsByTest);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

// Reorder questions
router.put("/test/:testId/reorder", reorderQuestions);

export default router;

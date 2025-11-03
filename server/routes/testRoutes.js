import express from "express";
import {
  createTest,
  getMyTests,
  getTestById,
  updateInstructions,
  publishTest,
  deleteTest,
  updateTest,
} from "../controllers/testController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Test CRUD operations
router.post("/create", createTest);
router.get("/my-tests", getMyTests);
router.get("/:id", getTestById);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);

// Test specific operations
router.put("/:id/instructions", updateInstructions);
router.put("/:id/publish", publishTest);

export default router;

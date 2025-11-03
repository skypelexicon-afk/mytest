import express from "express";
import {
  toggleSubsectionComplete,
  getCourseProgress,
  getAllCoursesProgress
} from "../controllers/progressController.js";
import auth from "../middlewares/auth.js";

const progressRouter = express.Router();

// Toggle subsection completion (mark/unmark as complete)
progressRouter.post("/toggle", auth, toggleSubsectionComplete);

// Get progress for a specific course
progressRouter.get("/course/:courseId", auth, getCourseProgress);

// Get progress for all courses
progressRouter.get("/all", auth, getAllCoursesProgress);

export default progressRouter;

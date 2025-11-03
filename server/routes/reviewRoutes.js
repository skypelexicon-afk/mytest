import express from "express";
import { createReview, getAllReviews, getReviewsUser, deleteReview, getReviewsByAdmin, approveReviewByAdmin, unapproveReviewByAdmin } from "../controllers/reviewController.js";
import auth from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/checkAdmin.js"

const reviewRouter = express.Router();

reviewRouter.post("/", auth, createReview);
reviewRouter.get("/admin", auth, isAdmin, getReviewsByAdmin);
reviewRouter.get("/user", auth, getReviewsUser);
reviewRouter.get("/:course_id", getAllReviews);
reviewRouter.delete("/:id", auth, deleteReview);
reviewRouter.put("/approve/:id", auth, isAdmin, approveReviewByAdmin);
reviewRouter.put("/unapprove/:id", auth, isAdmin, unapproveReviewByAdmin);

export default reviewRouter;

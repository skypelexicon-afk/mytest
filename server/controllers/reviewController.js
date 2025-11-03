import { reviews, users } from "../schema/schema.js";
import { db } from "../db/client.js";
import { eq, and } from "drizzle-orm";
import logger from "../utils/logger.js";

// Create a review by user
export const createReview = async (req, res) => {
  try {
    const { course_id, rating, comment } = req.body;

    const result = await db.insert(reviews).values({
      user_id: req.user.id,
      course_id,
      rating,
      comment,
    }).returning();

    logger.info(`New review created by user ID ${req.user.id} for course ID ${course_id}`);
    res.status(201).json({ review: result[0] });
  } catch (err) {
    res.status(500).json({ error: "Review submission failed" });
  }
};

// Get the reviews created by user
export const getReviewsUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    console.log("User ID: ", user_id);
    const userReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        updated_at: reviews.updated_at,
        user_id: reviews.user_id,
        course_id: reviews.course_id,
      })
      .from(reviews)
      .where(eq(reviews.user_id, Number(user_id)));

    if (!userReviews.length) {
      return res.status(404).json({ message: "No reviews found" });
    }

    res.status(200).json({ reviews: userReviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// All approved reviews to be shown on explore page
export const getAllReviews = async (req, res) => {
  try {
    const { course_id } = req.params;

    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        updated_at: reviews.updated_at,
        course_id: reviews.course_id,
        user_name: users.name,
      })
      .from(reviews)
      .where(and(eq(reviews.isApproved, true), eq(reviews.course_id, Number(course_id))))
      .leftJoin(users, eq(reviews.user_id, users.id));

    if (!allReviews.length) {
      return res.status(404).json({ message: "No reviews found" });
    }

    res.status(200).json({ reviews: allReviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};


// Delete a review by ID (only by owner or admin)
export const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db
      .delete(reviews)
      .where(eq(reviews.id, Number(id)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Review not found or already deleted" });
    }

    logger.info(`Review with ID ${id} deleted by user ID ${req.user.id}`);
    res.status(200).json({ message: "Review deleted successfully", review: deleted[0] });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get all the reviews by admin
export const getReviewsByAdmin = async (req, res) => {
  try {
    const response = await db.select({
      id: reviews.id,
      user_id: reviews.user_id,
      user_name: users.name,
      user_email: users.email,
      course_id: reviews.course_id,
      rating: reviews.rating,
      comment: reviews.comment,
      isApproved: reviews.isApproved,
      created_at: reviews.created_at,
      updated_at: reviews.updated_at,
    })
      .from(reviews)
      .leftJoin(users, eq(reviews.user_id, users.id));

    logger.info(`All reviews fetched by admin ID ${req.user.id}`);
    res.status(200).json({ reviews: response });
  } catch (err) {
    logger.error(`Failed to fetch reviews by admin ID ${req.user.id}`);
    console.log(err);
    res.status(500).json({ error: "Failed to fetch reviews by admin" });
  }
}

// Approve a review
export const approveReviewByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await db
      .update(reviews)
      .set({ isApproved: true })
      .where(eq(reviews.id, Number(id)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Review not found or already approved" });
    }

    logger.info(`Review with ID ${id} approved by admin ID ${req.user.id}`);
    res.status(200).json({ message: "Review approved successfully", review: updated[0] });
  } catch (err) {
    console.error("Error approving review:", err);
    res.status(500).json({ error: "Failed to approve review" });
  }
}

// Unapprove a review
export const unapproveReviewByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await db
      .update(reviews)
      .set({ isApproved: false })
      .where(eq(reviews.id, Number(id)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Review not found or already approved" });
    }

    logger.info(`Review with ID ${id} unapproved by admin ID ${req.user.id}`);
    res.status(200).json({ message: "Review unapproved successfully", review: updated[0] });
  } catch (err) {
    console.error("Error unapproving review:", err);
    res.status(500).json({ error: "Failed to unapprove review" });
  }
}
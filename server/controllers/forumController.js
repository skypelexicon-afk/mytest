import { db } from "../db/client.js";
import { forums } from "../schema/schema.js";
import { eq } from "drizzle-orm";
import logger from "../utils/logger.js";

export const postComment = async (req, res) => {
  try {
    const { comment, upload } = req.body;

    const result = await db.insert(forums).values({
      user_id: req.user.id,
      comment,
      upload,
    }).returning();

    res.status(201).json({ forum: result[0] });
    logger.info(`New forum post created by user ID ${req.user.id}`);
  } catch (err) {
    res.status(500).json({ error: "Forum post failed" });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const allComments = await db.select().from(forums);
    res.status(200).json({ comments: allComments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch forum comments" });
  }
};

// Delete a specific comment (only if created by the user or admin)
export const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db
      .delete(forums)
      .where(eq(forums.id, Number(id)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Comment not found" });
    }

    logger.info(`Comment with ID ${id} deleted by user ID ${req.user.id}`);
    res.status(200).json({ message: "Comment deleted", comment: deleted[0] });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete forum comment" });
  }
};
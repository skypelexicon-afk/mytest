import express from "express";
import { postComment, getAllComments, deleteComment } from "../controllers/forumController.js";
import auth from "../middlewares/auth.js";

const ForumRouter = express.Router();


ForumRouter.post("/", auth, postComment);


ForumRouter.get("/", getAllComments);

// Delete a comment by ID (auth required)
ForumRouter.delete("/:id", auth, deleteComment);

export default ForumRouter;

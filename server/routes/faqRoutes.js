import express from "express";
import { approveFAQ, getAllFAQs } from "../controllers/faqController.js";
import auth from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/checkAdmin.js";

const faqRouter = express.Router();

faqRouter.get("/:courseId", auth, isAdmin, getAllFAQs);
faqRouter.patch("/approve/:id", auth, isAdmin, approveFAQ);

export default faqRouter;

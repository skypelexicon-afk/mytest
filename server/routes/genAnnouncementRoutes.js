import express from "express";
import {
  getGeneralAnnouncements,
  createGeneralAnnouncement,
  updateGeneralAnnouncement,
  deleteGeneralAnnouncement,
} from "../controllers/generalAnnouncementController.js";

import auth from "../middlewares/auth.js";

const anncRouter = express.Router();

anncRouter.get("/", getGeneralAnnouncements);
anncRouter.post("/", auth, createGeneralAnnouncement);
anncRouter.patch("/:id", auth, updateGeneralAnnouncement);
anncRouter.delete("/:id", auth, deleteGeneralAnnouncement);

export default anncRouter;

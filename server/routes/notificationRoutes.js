import express from "express";
import { getRecentOrders } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", getRecentOrders);

export default notificationRouter;
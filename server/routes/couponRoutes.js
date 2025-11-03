import express from "express"

import {
    createCoupon,
    verifyCouponCode,
    deleteCoupon
} from "../controllers/couponController.js";
import { isAdmin } from "../middlewares/checkAdmin.js";
import auth from "../middlewares/auth.js";

const couponRoutes = express.Router();

couponRoutes.post("/", auth, isAdmin, createCoupon);
couponRoutes.post("/verify-code",auth, verifyCouponCode);
couponRoutes.delete("/:id",auth, isAdmin, deleteCoupon);

export default couponRoutes;
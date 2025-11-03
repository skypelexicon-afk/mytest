import express from "express";
import { register, login, getProfile, updateProfile, getMyCourses, getMyOrders, getMyCreatedCourses, refreshAccessToken, logout, verifyEmail, forgotPassword, changePassword, getEnrollments, getAdminDashboardData, getProfileAll, getEnrollmentsAll, getWebsiteStats } from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import { googleLogin } from "../middlewares/googleAuth.js";
import { isEducatorOrAdmin } from "../middlewares/checkAdminEdu.js"
import { isAdmin } from "../middlewares/checkAdmin.js"


const router = express.Router();

// Auth
router.post("/register", register);
router.post("/verify-email", verifyEmail)
router.post("/login", login);
router.post("/logout", auth, logout)
router.post("/google-login", googleLogin);

// Protected routes
router.get("/profile", auth, getProfile);
router.get("/profileAll", auth, getProfileAll)
router.put("/profile", auth, updateProfile);
router.get("/my-courses", auth, getMyCourses);
router.get("/my-orders", auth, getMyOrders);
router.get("/my-created-courses", auth, isEducatorOrAdmin, getMyCreatedCourses);
router.get("/my-enrollments", auth, isEducatorOrAdmin, getEnrollments);
router.get("/admin-enrollments", auth, isAdmin, getEnrollmentsAll);
router.get("/admin-data", auth, isAdmin, getAdminDashboardData);

router.post("/refresh-token", refreshAccessToken)

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", changePassword);

router.get("/website-stats", getWebsiteStats);

export default router;
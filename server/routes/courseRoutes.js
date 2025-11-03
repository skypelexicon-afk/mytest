import express from "express";
import {
  createCourse,
  addSectionToCourse,
  getCourses,
  updateCourse,
  getCourseWithDetails,
  addSubsectionsToSection,
  getCourseWithDetailsUnAuth,
  deleteCourse,
  updateSection,
  updateSubSection,
  deleteSection,
  deleteSubSection,
  getCoursesByAdmin,
  activateOrDeactivateCourse,
  reorderSections,
  reorderSubSections,
  bulkUpdateFreeStatus
} from "../controllers/courseController.js";

import {
  createFAQ,
  getApprovedFAQs,
  isOwner,
} from "../controllers/faqController.js";

import {
  createAccouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js"

import auth from "../middlewares/auth.js";
import { isEducatorOrAdmin } from "../middlewares/checkAdminEdu.js";

const courseRouter = express.Router();

courseRouter.post("/createCourse", auth, isEducatorOrAdmin, createCourse);
courseRouter.post("/createCourse/:courseId/section", auth, isEducatorOrAdmin, addSectionToCourse);
courseRouter.put("/updateCourse/:id", auth, isEducatorOrAdmin, updateCourse);
courseRouter.put("/updateSection/:sectionId", auth, isEducatorOrAdmin, updateSection);
courseRouter.put("/updateSubsection/:subSectionId", auth, isEducatorOrAdmin, updateSubSection);
courseRouter.delete("/deleteCourse/:id", auth, isEducatorOrAdmin, deleteCourse);
courseRouter.delete("/deleteSection/:sectionId", auth, isEducatorOrAdmin, deleteSection);
courseRouter.delete("/deleteSubsection/:subSectionId", auth, isEducatorOrAdmin, deleteSubSection);
courseRouter.put("/addSubsection/:sectionId", auth, isEducatorOrAdmin, addSubsectionsToSection);

// Reordering routes
courseRouter.put("/reorder-sections/:courseId", auth, isEducatorOrAdmin, reorderSections);
courseRouter.put("/reorder-subsections/:sectionId", auth, isEducatorOrAdmin, reorderSubSections);

// Bulk update free status route
courseRouter.put("/bulk-update-free-status", auth, isEducatorOrAdmin, bulkUpdateFreeStatus);

courseRouter.get("/", getCourses);
courseRouter.get("/adminCourses", auth, isEducatorOrAdmin, getCoursesByAdmin);
courseRouter.put("/toggleCourseStatus/:courseId", auth, isEducatorOrAdmin, activateOrDeactivateCourse);
courseRouter.get("/:courseId", auth, getCourseWithDetails);
courseRouter.get("/unauth/:courseId", getCourseWithDetailsUnAuth);

// FAQ routes
courseRouter.get("/:courseId/faqs", getApprovedFAQs);
courseRouter.post("/:courseId/faqs", auth, isEducatorOrAdmin, isOwner, createFAQ);

// Announcement routes
courseRouter.post("/:courseId/announcement", auth, isEducatorOrAdmin, createAccouncement);
courseRouter.get("/:courseId/announcement", auth, getAnnouncements);
courseRouter.put("/:announcementId/announcement", auth, isEducatorOrAdmin, updateAnnouncement);
courseRouter.delete("/:courseId/:announcementId/announcement", auth, isEducatorOrAdmin, deleteAnnouncement);

export default courseRouter;
import express from "express";
import auth from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/checkAdmin.js";
import { createCoursePdf, deleteCoursePdf, getAllPdfForCourses, updateCoursePdf } from "../controllers/freePDF.js";

const pdfRouter = express.Router();

pdfRouter.post("/create", auth, isAdmin, createCoursePdf);
pdfRouter.put("/update/:id", auth, isAdmin, updateCoursePdf);
pdfRouter.delete("/delete/:id", auth, isAdmin, deleteCoursePdf);
pdfRouter.get("/all", getAllPdfForCourses);

export default pdfRouter;
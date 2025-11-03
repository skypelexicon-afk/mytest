import { eq, asc } from "drizzle-orm";
import { db } from "../db/client.js";
import { freePdf } from "../schema/schema.js";
import logger from "../utils/logger.js";

export const createCoursePdf = async (req, res) => {
    const { title, file_url } = req.body;
    const response = await db.insert(freePdf).values({
        title: title,
        file_url: file_url
    }).returning()

    logger.info(`Created PDF link\n${response}`);
    console.log("Created PDF link: ", response);
    res.status(201).json({ message: "PDF Created Successfully", pdf: response[0] });
}

export const updateCoursePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, file_url } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const response = await db
            .update(freePdf)
            .set({
                title,
                file_url,
            })
            .where(eq(freePdf.id, Number(id)))
            .returning();

        if (response.length === 0) {
            return res.status(404).json({ message: "PDF not found" });
        }

        logger.info(`Updated PDF link\n${response}`);
        console.log("Updated PDF link: ", response);

        res
            .status(200)
            .json({ message: "PDF Updated Successfully", pdf: response[0] });
    } catch (error) {
        console.error("Error updating PDF: ", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteCoursePdf = async (req, res) => {
    const { id } = req.params;
    const response = await db.delete(freePdf).where(eq(freePdf.id, id)).returning()

    logger.info(`Deleted PDF link with id ${id}`);
    res.status(200).json({ message: "PDF Deleted Successfully", pdf: response[0] });
}

export const getAllPdfForCourses = async (req, res) => {
    const response = await db.select().from(freePdf).orderBy(asc(freePdf.id));
    res.status(200).json({ message: "All PDFs Retrieved Successfully", pdfs: response });
}
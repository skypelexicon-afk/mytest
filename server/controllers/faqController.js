import { db } from "../db/client.js";
import { eq, and, desc } from 'drizzle-orm';
import { faqs, courses } from '../schema/schema.js';
import logger from '../utils/logger.js';

export const getApprovedFAQs = async (req, res) => {
    const courseId = parseInt(req.params.courseId);

    try {
        const result = await db.select().from(faqs).where(and(eq(faqs.course_id, courseId), eq(faqs.approved, true)))
        res.status(200).json({ faqs: result });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
};

export const getAllFAQs = async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    try {
        const result = await db
            .select()
            .from(faqs)
            .where(eq(faqs.course_id, courseId))
            .orderBy(desc(faqs.created_at));

        res.status(200).json({ faqs: result });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
}

export const isOwner = async (req, res, next) => {
    const educatorId = req.user.id;
    const { courseId } = req.body
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    try {
        const course = await db.select().from(courses).where(eq(courses.id, courseId));
        if (!course.length) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course[0].educator_id !== educatorId) {
            return res.status(403).json({ message: 'You are not the owner of this course' });
        }
        next();
    } catch (error) {
        console.log('Error checking course ownership:', error);
        res.status(500).json({ message: 'Failed to check course ownership' });
    }
}
// age middleware ta use kore faq create korbe
export const createFAQ = async (req, res) => {
    const { question, answer } = req.body;
    const course_id = parseInt(req.params.courseId);

    if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer required" });
    }

    try {
        const result = await db.insert(faqs).values({
            question,
            answer,
            course_id,
            educator_id: req.user.id,
            approved: false,
        }).returning();

        logger.info(`New FAQ created by user ID ${req.user.id} for course ID ${course_id}`);
        res.status(201).json({ message: "FAQ submitted", faq: result[0] });
    } catch (err) {
        console.error("Create FAQ error:", err);
        res.status(500).json({ message: "Failed to create FAQ" });
    }
};

//admin r kaj eta
export const approveFAQ = async (req, res) => {
    const faqId = parseInt(req.params.id);

    try {
        await db.update(faqs)
            .set({ approved: true, updated_at: new Date() })
            .where(eq(faqs.id, faqId));

        res.status(200).json({ message: 'FAQ approved successfully' });
    } catch (error) {
        console.error('Error approving FAQ:', error);
        res.status(500).json({ message: 'Failed to approve FAQ' });
    }
};
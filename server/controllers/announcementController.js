import { db } from "../db/client.js";
import { eq, and, desc, inArray } from 'drizzle-orm';
import { announcements, bundleCourses, bundles, courses, orderItems, orders } from '../schema/schema.js';
import logger from '../utils/logger.js';

export const createAccouncement = async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);

        if (isNaN(courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        // check if the educator owns the course if the user is not admin
        if (req.user.role !== "super_admin") {
            const educatorCourse = await db.select()
                .from(courses)
                .where(and(
                    eq(courses.id, courseId),
                    eq(courses.educator_id, req.user.id),
                    eq(courses.is_active, true) // Ensure the course is active
                ));

            if (educatorCourse.length === 0) {
                return res.status(403).json({ message: "You are not authorized to post announcements for this course" });
            }
        }

        const { title, message, pinned = false } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message required" });
        }

        const result = await db.insert(announcements).values({
            course_id: courseId,
            title,
            message,
            pinned
        }).returning();

        logger.info(`New annoucement created by user ID ${req.user.id} for course ID ${courseId}`);
        res.status(201).json({ message: "Announcement created", announcement: result[0] });
    } catch (err) {
        console.error('Error creating annoucement:', err);
        res.status(500).json({ message: 'Failed to create announcement' });
    }
}

export const getAnnouncements = async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const userId = parseInt(req.user.id);

        if (isNaN(courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }
        if (req.user.role === "super_admin") {

            const announcementsList = await db
                .select()
                .from(announcements)
                .where(eq(announcements.course_id, courseId))
                .orderBy(desc(announcements.pinned), desc(announcements.updated_at)); // sort pinned first and updated announcements

            res.status(200).json({ announcements: announcementsList });
        }
        if (req.user.role === "educator") {
            // check if the educator owns the course
            const educatorCourse = await db.select()
                .from(courses)
                .where(and(
                    eq(courses.id, courseId),
                    eq(courses.educator_id, req.user.id),
                    eq(courses.is_active, true) // Ensure the course is active
                ));

            if (educatorCourse.length === 0) {
                return res.status(403).json({ message: "You are not authorized to get announcements for this course" });
            }

            const announcementsList = await db
                .select()
                .from(announcements)
                .where(eq(announcements.course_id, courseId))
                .orderBy(desc(announcements.pinned), desc(announcements.updated_at)); // sort pinned first and updated announcements

            res.status(200).json({ announcements: announcementsList });
        }
        else if (req.user.role === "student") {
            const orderItemsRows = await db
                .select({
                    courseId: orderItems.course_id,
                    bundleId: orderItems.bundle_id,
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.order_id, orders.id))
                .where(
                    and(
                        eq(orders.user_id, userId),
                        eq(orders.status, "processed")
                    )
                );


            const directCourseIds = orderItemsRows
                .filter(item => item.courseId !== null)
                .map(item => item.courseId);

            const bundleIds = orderItemsRows
                .filter(item => item.bundleId !== null)
                .map(item => item.bundleId);

            let bundleCourseIds = [];
            if (bundleIds.length) {
                const bcRows = await db
                    .select({ course_id: bundleCourses.course_id })
                    .from(bundleCourses)
                    .where(inArray(bundleCourses.bundle_id, bundleIds));

                bundleCourseIds = bcRows.map((row) => row.course_id);
            }

            // Step 4: Combine and check purchase
            const purchasedCourseIds = new Set([...directCourseIds, ...bundleCourseIds]);

            const isPurchased = purchasedCourseIds.has(Number(courseId));

            // Step 5: Return based on access
            if (isPurchased) {
                const announcementsList = await db
                    .select()
                    .from(announcements)
                    .where(eq(announcements.course_id, courseId))
                    .orderBy(desc(announcements.pinned), desc(announcements.updated_at)); // sort pinned first and updated announcements
                res.status(200).json({ announcements: announcementsList });
            } else if (req.user.email === "srijandatta868@gmail.com" || req.user.email === "sandipan18vk@gmail.com" || req.user.email === "tendingtoinfinitydevelopers@gmail.com") {
                const announcementsList = await db
                    .select()
                    .from(announcements)
                    .where(eq(announcements.course_id, courseId))
                    .orderBy(desc(announcements.pinned), desc(announcements.updated_at)); // sort pinned first and updated announcements
                res.status(200).json({ announcements: announcementsList });
            }
        }
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ message: 'Failed to retrieve announcements' });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const announcementId = parseInt(req.params.announcementId);
        const { title, message, pinned } = req.body;

        if (isNaN(announcementId)) {
            return res.status(400).json({ message: "Invalid announcement ID" });
        }

        // Verify educator if the user is not admin
        if (req.user.role !== "super_admin") {
            const result = await db.select({
                announcementId: announcements.id,
                courseId: announcements.course_id,
            })
                .from(announcements)
                .innerJoin(courses, eq(announcements.course_id, courses.id))
                .where(and(
                    eq(announcements.id, announcementId),
                    eq(courses.educator_id, req.user.id)
                ));

            if (result.length === 0) {
                return res.status(403).json({ message: "You are not authorized to update this announcement" });
            }
        }

        const updateData = {
            ...(title !== undefined && { title }),
            ...(message !== undefined && { message }),
            ...(pinned !== undefined && { pinned }),
        };

        const updated = await db.update(announcements)
            .set(updateData)
            .where(eq(announcements.id, announcementId))
            .returning();

        logger.info(`Announcement with id ${announcementId} updated by user ID ${req.user.id}`)
        res.status(200).json({ message: "Announcement updated", announcement: updated[0] });

    } catch (err) {
        console.error("Error updating announcement:", err);
        res.status(500).json({ message: "Failed to update announcement" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const announcementId = parseInt(req.params.announcementId);

        if (isNaN(courseId) || isNaN(announcementId)) {
            return res.status(400).json({ message: "Invalid course ID or announcement ID" });
        }

        // check if the educator owns the course if the user is not admin
        if (req.user.role !== "super_admin") {
            const educatorCourse = await db.select()
                .from(courses)
                .where(and(
                    eq(courses.id, courseId),
                    eq(courses.educator_id, req.user.id),
                    eq(courses.is_active, true)
                ));

            if (educatorCourse.length === 0) {
                return res.status(403).json({ message: "You are not authorized to delete announcements for this course" });
            }
        }

        // check if announcement exists and belongs to course
        const announcement = await db.select()
            .from(announcements)
            .where(and(
                eq(announcements.id, announcementId),
                eq(announcements.course_id, courseId)
            ));

        if (announcement.length === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        // delete the announcement
        await db.delete(announcements)
            .where(eq(announcements.id, announcementId));

        logger.info(`Announcement ID ${announcementId} deleted by user ID ${req.user.id} for course ID ${courseId}`);
        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (err) {
        console.error("Error deleting announcement:", err);
        res.status(500).json({ success: false, message: "Failed to delete announcement" });
    }
};

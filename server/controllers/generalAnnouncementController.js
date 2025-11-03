import { db } from "../db/client.js";
import { generalAnnouncements } from "../schema/schema.js";
import { eq, desc } from "drizzle-orm";

// ✅ GET /api/general-announcements?page=1
// Students & all roles can view announcements (10 at a time)
export const getGeneralAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Fetch total count for pagination
    const total = await db
      .select()
      .from(generalAnnouncements);

    const totalCount = total.length;

    const announcements = await db
      .select()
      .from(generalAnnouncements)
      .orderBy(desc(generalAnnouncements.pinned), desc(generalAnnouncements.updated_at))
      .limit(limit)
      .offset(offset);

    res.status(200).json({
      announcements,
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching general announcements:", err);
    res.status(500).json({ message: "Failed to retrieve announcements" });
  }
};

// ✅ POST /api/general-announcements
// Only super_admin can create
export const createGeneralAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, message, pinned = false } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const [newAnnouncement] = await db
      .insert(generalAnnouncements)
      .values({ title, message, pinned })
      .returning();

    res.status(201).json({
      message: "Announcement created successfully",
      announcement: newAnnouncement,
    });
  } catch (err) {
    console.error("Error creating general announcement:", err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

// ✅ PATCH /api/general-announcements/:id
// Only super_admin can update
export const updateGeneralAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const id = parseInt(req.params.id);
    const { title, message, pinned } = req.body;

    const [updated] = await db
      .update(generalAnnouncements)
      .set({
        ...(title && { title }),
        ...(message && { message }),
        ...(typeof pinned === "boolean" && { pinned }),
        updated_at: new Date(),
      })
      .where(eq(generalAnnouncements.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement: updated,
    });
  } catch (err) {
    console.error("Error updating general announcement:", err);
    res.status(500).json({ message: "Failed to update announcement" });
  }
};

// ✅ DELETE /api/general-announcements/:id
// Only super_admin can delete
export const deleteGeneralAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const id = parseInt(req.params.id);

    const deleted = await db
      .delete(generalAnnouncements)
      .where(eq(generalAnnouncements.id, id))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Error deleting general announcement:", err);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

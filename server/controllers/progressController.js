import { db } from '../db/client.js';
import { subsectionProgress, subSections, sections, courses } from '../schema/schema.js';
import { eq, and, inArray } from 'drizzle-orm';

// Toggle subsection completion status
export const toggleSubsectionComplete = async (req, res) => {
  try {
    const { subsectionId } = req.body;
    const userId = req.user.id;

    if (!subsectionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subsection ID is required' 
      });
    }

    // Check if progress record exists
    const existingProgress = await db
      .select()
      .from(subsectionProgress)
      .where(
        and(
          eq(subsectionProgress.user_id, userId),
          eq(subsectionProgress.subsection_id, Number(subsectionId))
        )
      );

    if (existingProgress.length > 0) {
      // Toggle the completion status
      const currentStatus = existingProgress[0].is_completed;
      const newStatus = !currentStatus;

      await db
        .update(subsectionProgress)
        .set({
          is_completed: newStatus,
          completed_at: newStatus ? new Date() : null,
          updated_at: new Date(),
        })
        .where(eq(subsectionProgress.id, existingProgress[0].id));

      return res.status(200).json({
        success: true,
        message: newStatus ? 'Marked as complete' : 'Marked as incomplete',
        isCompleted: newStatus,
      });
    } else {
      // Create new progress record (mark as complete)
      await db
        .insert(subsectionProgress)
        .values({
          user_id: userId,
          subsection_id: Number(subsectionId),
          is_completed: true,
          completed_at: new Date(),
        });

      return res.status(201).json({
        success: true,
        message: 'Marked as complete',
        isCompleted: true,
      });
    }
  } catch (error) {
    console.error('Error toggling subsection completion:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update progress' 
    });
  }
};

// Get user's progress for a specific course
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID is required' 
      });
    }

    // Get all sections for this course
    const courseSections = await db
      .select({ id: sections.id })
      .from(sections)
      .where(eq(sections.course_id, Number(courseId)));

    if (courseSections.length === 0) {
      return res.status(200).json({
        success: true,
        completedSubsections: [],
        totalSubsections: 0,
        completedCount: 0,
        percentage: 0,
      });
    }

    const sectionIds = courseSections.map(s => s.id);

    // Get all subsections for these sections
    const courseSubsections = await db
      .select({ id: subSections.id })
      .from(subSections)
      .where(inArray(subSections.section_id, sectionIds));

    const subsectionIds = courseSubsections.map(s => s.id);

    if (subsectionIds.length === 0) {
      return res.status(200).json({
        success: true,
        completedSubsections: [],
        totalSubsections: 0,
        completedCount: 0,
        percentage: 0,
      });
    }

    // Get user's completed subsections for this course
    const completedSubsections = await db
      .select()
      .from(subsectionProgress)
      .where(
        and(
          eq(subsectionProgress.user_id, userId),
          eq(subsectionProgress.is_completed, true),
          inArray(subsectionProgress.subsection_id, subsectionIds)
        )
      );

    const completedSubsectionIds = completedSubsections.map(progress => progress.subsection_id);

    const totalCount = subsectionIds.length;
    const completedCount = completedSubsectionIds.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return res.status(200).json({
      success: true,
      completedSubsections: completedSubsectionIds,
      totalSubsections: totalCount,
      completedCount,
      percentage,
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch progress' 
    });
  }
};

// Get progress for all user's courses (for enrollment dashboard)
export const getAllCoursesProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user's progress
    const userProgress = await db
      .select()
      .from(subsectionProgress)
      .where(
        and(
          eq(subsectionProgress.user_id, userId),
          eq(subsectionProgress.is_completed, true)
        )
      );

    return res.status(200).json({
      success: true,
      progress: userProgress,
    });
  } catch (error) {
    console.error('Error fetching all courses progress:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch progress' 
    });
  }
};

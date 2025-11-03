import { db } from '../db/client.js';
import { courses, sections, subSections, orders, faqs, bundleCourses, orderItems } from '../schema/schema.js';
import { eq, and, isNotNull, inArray, asc } from 'drizzle-orm';
import logger from '../utils/logger.js';
import SHA256 from "crypto-js/sha256.js";
import { getVideoLength } from '../utils/bunnyVideo.js';
import { extractYouTubeVideoId, generateYouTubeEmbedUrl } from '../utils/youtubeVideo.js';

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      image,
      description,
      price,
      target,
      startDate,
      endDate,
      originalPrice,
      discountLabel,
      educatorName,
      educatorImage,
      demoVideos, // Expected to be an array of YouTube URLs
      contents, // Expected to be an array of Strings
      faqs,
    } = req.body;

    const educator_id = req.user.id;

    if (!Array.isArray(demoVideos) || !demoVideos.every(url => typeof url === 'string')) {
      return res.status(400).json({
        success: false,
        message: 'demoVideos must be an array of YouTube URL strings',
      });
    }

    if (
      faqs &&
      (!Array.isArray(faqs) || !faqs.every(item =>
        typeof item.question === 'string' &&
        typeof item.answer === 'string'
      ))
    ) {
      return res.status(400).json({
        success: false,
        message: 'FAQs must be an array of { question, answer } objects',
      });
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        title,
        image,
        description,
        price,
        target,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        originalPrice,
        discountLabel,
        educator_id,
        educatorName,
        educatorImage,
        demoVideos,
        contents,
        faqs,
      })
      .returning({ id: courses.id });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      courseId: newCourse.id,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


export const addSectionToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, subSections: subSectionsData } = req.body;

    // Get the max order for sections in this course
    const maxOrderResult = await db
      .select({ maxOrder: sections.order })
      .from(sections)
      .where(eq(sections.course_id, Number(courseId)))
      .orderBy(asc(sections.order))
      .limit(1);
    
    const nextOrder = maxOrderResult.length > 0 
      ? Math.max(...await db.select({ order: sections.order }).from(sections).where(eq(sections.course_id, Number(courseId))).then(rows => rows.map(r => r.order))) + 1
      : 0;

    // Step 1: Insert the section
    const [newSection] = await db
      .insert(sections)
      .values({
        name,
        course_id: Number(courseId),
        order: nextOrder,
      })
      .returning({ id: sections.id });

    const sectionId = newSection.id;

    // Step 2: Insert subsections if any
    if (Array.isArray(subSectionsData) && subSectionsData.length > 0) {
      let subsectionInserts = [];
      let subOrder = 0;
      for (const sub of subSectionsData) {
        // Extract YouTube video ID if youtube_video_url is provided
        const youtubeVideoId = sub.youtube_video_url ? extractYouTubeVideoId(sub.youtube_video_url) : null;
        
        let temp = {
          name: sub.name,
          type: sub.type,
          file_url: sub.file_url,
          youtube_video_url: youtubeVideoId ? sub.youtube_video_url : null,
          is_free: youtubeVideoId ? true : (sub.is_free || false), // Auto-set to true if YouTube URL provided
          section_id: sectionId,
          order: subOrder++,
        }
        // Fetch and include the video length if the file is a video (only for Bunny videos)
        if (sub.type === "video" && !youtubeVideoId) {
          try {
            temp["duration"] = await getVideoLength(sub.file_url);
          } catch (err) {
            console.log("Error fetching video duration for video id: ", sub.file_url);
            temp["duration"] = "";
          }
        } else {
          temp["duration"] = "";
        }
        subsectionInserts.push(temp);
      }
      await db.insert(subSections).values(subsectionInserts);
    }

    return res.status(201).json({
      success: true,
      message: "Section and subsections added successfully",
      sectionId,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    return res.status(500).json({ success: false, message: "Failed to add section" });
  }
};

export const updateSection = async (req, res) => {
  try {
    const sectionId = parseInt(req.params.sectionId); // FIXED: Ensure it's a number
    const { name, course_id } = req.body;

    if (isNaN(sectionId)) {
      return res.status(400).json({ success: false, message: 'Invalid section ID' });
    }

    const result = await db
      .update(sections)
      .set({
        name,
        course_id: Number(course_id),
        updated_at: new Date(),
      })
      .where(eq(sections.id, sectionId));

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return res.status(500).json({ success: false, message: "Failed to update section" });
  }
};


export const updateSubSection = async (req, res) => {
  try {
    const subSectionID = parseInt(req.params.subSectionId);
    const { name, type, file_url, youtube_video_url, is_free } = req.body;

    // Step 1: Insert the section
    const existing = await db
      .select()
      .from(subSections)
      .where(eq(subSections.id, subSectionID))

    if (existing.length === 0 && !existing[0]) {
      return res.status(404).json({ success: false, message: 'Subsection not found' });
    }

    // Extract YouTube video ID if provided
    const youtubeVideoId = youtube_video_url ? extractYouTubeVideoId(youtube_video_url) : null;
    
    // Update the duration if it is a video (only for Bunny videos)
    let duration = "";
    if (type === "video" && file_url && !youtubeVideoId) {
      try {
        duration = await getVideoLength(file_url);
      } catch (err) {
        console.log("Error fetching video duration for video id: ", file_url);
      }
    }

    // Determine is_free value
    let isFreeValue = is_free;
    if (youtubeVideoId) {
      isFreeValue = true; // Auto-set to true if YouTube URL provided
    }

    await db
      .update(subSections)
      .set({
        ...(name && { name }),
        ...(type && { type }),
        ...(file_url && { file_url }),
        ...(youtube_video_url !== undefined && { youtube_video_url: youtubeVideoId ? youtube_video_url : null }),
        ...(isFreeValue !== undefined && { is_free: isFreeValue }),
        ...{ duration },
        updated_at: new Date(),
      })
      .where(eq(subSections.id, Number(subSectionID)));

    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
    });

  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, message: 'Failed to update section' });

  }
}



export const getCourses = async (req, res) => {
  try {
    const allCourses = await db.select().from(courses).where(eq(courses.is_active, true));
    
    // For each course, count free videos
    const coursesWithFreeCount = await Promise.all(
      allCourses.map(async (course) => {
        const courseSections = await db
          .select()
          .from(sections)
          .where(eq(sections.course_id, course.id));
        
        const sectionIds = courseSections.map(s => s.id);
        
        let freeVideoCount = 0;
        if (sectionIds.length > 0) {
          const freeSubsections = await db
            .select()
            .from(subSections)
            .where(
              and(
                inArray(subSections.section_id, sectionIds),
                eq(subSections.is_free, true)
              )
            );
          freeVideoCount = freeSubsections.length;
        }
        
        return {
          ...course,
          totalFreeVideos: freeVideoCount
        };
      })
    );
    
    res.status(200).json({ success: true, courses: coursesWithFreeCount });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};
export const getCoursesByAdmin = async (req, res) => {
  try {
    const allCourses = await db.select().from(courses);
    res.status(200).json(allCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};


export const updateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    const {
      title,
      image,
      description,
      price,
      demoVideos,
      contents,
      startDate,
      endDate,
      originalPrice,
      discountLabel,
      educator_id,
      educatorName,
      educatorImage,
      faqs,
    } = req.body;

    // Validate demoVideos if present
    if (demoVideos && (!Array.isArray(demoVideos) || !demoVideos.every(url => typeof url === 'string'))) {
      return res.status(400).json({
        success: false,
        message: 'demoVideos must be an array of YouTube URL strings',
      });
    }

    // Validate contents if present
    if (contents && (!Array.isArray(contents) || !contents.every(item => typeof item === 'string'))) {
      return res.status(400).json({
        success: false,
        message: 'contents must be an array of strings',
      });
    }

    // Validate faqs if present
    if (
      faqs &&
      (!Array.isArray(faqs) || !faqs.every(item =>
        typeof item.question === 'string' &&
        typeof item.answer === 'string'
      ))
    ) {
      return res.status(400).json({
        success: false,
        message: 'FAQs must be an array of { question, answer } objects',
      });
    }

    const result = await db.update(courses)
      .set({
        ...(title && { title }),
        ...(image && { image }),
        ...(description && { description }),
        ...(price && { price }),
        ...(demoVideos && { demoVideos }),
        ...(contents && { contents }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(originalPrice && { originalPrice }),
        ...(discountLabel && { discountLabel }),
        ...(educator_id && { educator_id }),
        ...(educatorName && { educatorName }),
        ...(educatorImage && { educatorImage }),
        ...(faqs && { faqs }),
        updated_at: new Date()
      })
      .where(eq(courses.id, courseId));

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      result,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
    });
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id); // Assuming route: /api/course/:id

    const sectionRows = await db.select({ id: sections.id }).from(sections).where(eq(sections.course_id, courseId)); // 10ms
    if (sectionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const sectionIds = sectionRows.map(row => row.id);

    if (sectionIds.length > 0) {
      await db.delete(subSections).where(inArray(subSections.section_id, sectionIds)); // 500ms
      await db.delete(sections).where(inArray(sections.id, sectionIds)); // 10ms
    }

    const result = await db.delete(courses).where(eq(courses.id, courseId));

    if (result.numDeletedRows === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
}

export const deleteSection = async (req, res) => {
  try {
    console.log("Section ID:", req.params.sectionId);
    const sectionId = parseInt(req.params.sectionId); // Assuming route: /api/course/:id

    const result = await db.select({ id: subSections.id }).from(subSections).where(eq(subSections.section_id, sectionId)); // 10ms

    if (result.length !== 0) {
      const subSectionIds = result.map(row => row.id);

      if (subSectionIds.length > 0) {
        await db.delete(subSections).where(inArray(subSections.id, subSectionIds)); // 500ms
      }
    }

    const sectionDelete = await db.delete(sections).where(eq(sections.id, sectionId)); // 10ms
    if (sectionDelete.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
}

export const deleteSubSection = async (req, res) => {
  try {
    console.log("Subsection ID:", req.params.subSectionId);
    const subSectionId = parseInt(req.params.subSectionId); // Assuming route: /api/course/:id

    await db.delete(subSections).where(eq(subSections.id, subSectionId)); // 10ms

    res.status(200).json({ success: true, message: 'Subsection deleted successfully' });
  } catch (error) {
    console.error('Error deleting subsection:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subsection' });

  }
}

function generateSignedEmbedUrl(videoId) {
  const BUNNY_TOKEN_SECURITY_KEY = process.env.BUNNY_TOKEN_SECURITY_KEY;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

  const expires = Math.floor(Date.now() / 1000) + 3 * 3600; // 3 hours expiry

  const tokenString = `${BUNNY_TOKEN_SECURITY_KEY}${videoId}${expires}`;
  const token = SHA256(tokenString).toString();
  // const token = crypto.createHash("sha256").update(tokenString).digest("hex");

  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true&token=${token}&expires=${expires}`;
}

export const getCourseWithDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // Assuming user is authenticated
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.is_active, true)),
      with: {
        sections: {
          orderBy: asc(sections.order),
          with: {
            subSections: {
              orderBy: asc(subSections.order),
            }
          }
        },
      },
    });


    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or inactive" });
    }


    const modifiedCourse = {
      ...course,
      sections: course.sections.map(section => ({
        ...section,
        subSections: section.subSections.map((sub) => ({
          subSectionId: sub.id,
          name: sub.name,
          duration: sub.type === "video" ? sub.duration : "",
        }))
      }))
    }

    const courseWithSignedUrls = {
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        subSections: section.subSections.map((sub) => {
          // Extract YouTube video ID if youtube_video_url exists
          const youtubeVideoId = sub.youtube_video_url ? extractYouTubeVideoId(sub.youtube_video_url) : null;
          
          // Generate both URLs separately
          let bunnyVideoUrl = null;
          let youtubeEmbedUrl = null;
          let displayUrl = sub.file_url; // Default for non-video types
          
          if (sub.type === "video") {
            // Generate Bunny signed URL if file_url exists
            const hasBunnyVideo = sub.file_url && sub.file_url.trim() !== '';
            if (hasBunnyVideo) {
              bunnyVideoUrl = generateSignedEmbedUrl(sub.file_url);
            }
            // Generate YouTube embed URL if available
            if (youtubeVideoId) {
              youtubeEmbedUrl = generateYouTubeEmbedUrl(youtubeVideoId);
            }
            
            // Video display logic for PAID students:
            // 1. If both Bunny AND YouTube exist → use Bunny
            // 2. If only YouTube exists → use YouTube
            // 3. If only Bunny exists → use Bunny
            if (hasBunnyVideo && youtubeEmbedUrl) {
              // Both exist - paid students see Bunny
              displayUrl = bunnyVideoUrl;
            } else if (youtubeEmbedUrl) {
              // Only YouTube exists - show to paid students too
              displayUrl = youtubeEmbedUrl;
            } else if (hasBunnyVideo) {
              // Only Bunny exists - show to paid students
              displayUrl = bunnyVideoUrl;
            } else {
              // Fallback to original file_url
              displayUrl = sub.file_url;
            }
          }
          
          return {
            subSectionId: sub.id,
            name: sub.name,
            file_url: displayUrl, // Primary display URL for paid students
            bunny_video_url: bunnyVideoUrl, // Bunny CDN URL (for paid students)
            youtube_video_url: youtubeEmbedUrl, // YouTube URL (for free/non-paid students)
            type: sub.type,
            duration: sub.type === "video" ? sub.duration : "",
            is_free: sub.is_free || false,
          };
        }),
      })),
    };

    // Give access to all courses to some users
    if (req.user.id === course.educator_id || req.user.email === "srijandatta868@gmail.com" || req.user.email === "sandipan18vk@gmail.com" || req.user.email === "tendingtoinfinitydevelopers@gmail.com")
      return res.status(200).json({
        success: true,
        isPurchased: true,
        course: courseWithSignedUrls,
      });

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

    console.log("Bundle ids:", bundleIds);

    let bundleCourseIds = [];
    if (bundleIds.length) {
      const bcRows = await db
        .select({ course_id: bundleCourses.course_id })
        .from(bundleCourses)
        .where(inArray(bundleCourses.bundle_id, bundleIds));

      // console.log("Bundle Course IDs:", bcRows);

      bundleCourseIds = bcRows.map((row) => row.course_id);
    }

    // Step 4: Combine and check purchase
    const purchasedCourseIds = new Set([...directCourseIds, ...bundleCourseIds]);
    console.log("Purchased Course IDs:", purchasedCourseIds);

    const isPurchased = purchasedCourseIds.has(Number(courseId));

    // Step 5: Return based on access
    if (isPurchased) {
      logger.info(`UserID: ${req.user.id} fetched courses ${purchasedCourseIds}`);
      return res.status(200).json({
        success: true,
        isPurchased: true,
        course: courseWithSignedUrls,
      });
    }

    return res.status(200).json({
      success: true,
      isPurchased: false,
      course: modifiedCourse,
    });

  } catch (error) {
    console.error("Error fetching course with details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch course" });
  }
};

export const getCourseWithDetailsUnAuth = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.is_active, true)),
      with: {
        sections: {
          orderBy: asc(sections.order),
          with: {
            subSections: {
              orderBy: asc(subSections.order),
            }
          }
        },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Count total free videos
    let totalFreeVideos = 0;
    course.sections.forEach(section => {
      section.subSections.forEach(sub => {
        if (sub.is_free) {
          totalFreeVideos++;
        }
      });
    });

    const modifiedCourse = {
      ...course,
      totalFreeVideos, // Add total free videos count
      sections: course.sections.map(section => ({
        ...section,
        freeVideosCount: section.subSections.filter(sub => sub.is_free).length, // Count per section
        subSections: section.subSections.map((sub) => {
          // For free videos, include the video URL
          let videoUrl = null;
          let youtubeEmbedUrl = null;
          let bunnyVideoUrl = null;
          
          if (sub.is_free && sub.type === "video") {
            const youtubeVideoId = sub.youtube_video_url ? extractYouTubeVideoId(sub.youtube_video_url) : null;
            
            // Generate YouTube embed URL if available
            if (youtubeVideoId) {
              youtubeEmbedUrl = generateYouTubeEmbedUrl(youtubeVideoId);
            }
            
            // Generate Bunny signed URL if file_url exists
            const hasBunnyVideo = sub.file_url && sub.file_url.trim() !== '';
            if (hasBunnyVideo) {
              bunnyVideoUrl = generateSignedEmbedUrl(sub.file_url);
            }
            
            // Video display logic for NON-PAID/FREE students:
            // 1. If both Bunny AND YouTube exist → use YouTube
            // 2. If only YouTube exists → use YouTube
            // 3. If only Bunny exists → use Bunny (for free videos)
            if (hasBunnyVideo && youtubeEmbedUrl) {
              // Both exist - non-paid students see YouTube
              videoUrl = youtubeEmbedUrl;
            } else if (youtubeEmbedUrl) {
              // Only YouTube exists
              videoUrl = youtubeEmbedUrl;
            } else if (hasBunnyVideo) {
              // Only Bunny exists (for free videos)
              videoUrl = bunnyVideoUrl;
            } else {
              // Fallback
              videoUrl = sub.file_url;
            }
          }
          
          return {
            subSectionId: sub.id,
            name: sub.name,
            type: sub.type,
            duration: sub.type === "video" ? sub.duration : "",
            is_free: sub.is_free || false,
            file_url: videoUrl, // Only include URL for free videos
            bunny_video_url: bunnyVideoUrl, // Bunny URL for reference
            youtube_video_url: youtubeEmbedUrl, // YouTube URL
          };
        })
      }))
    }
    
    return res.status(200).json({
      success: true,
      isPurchased: false,
      course: modifiedCourse
    });

  } catch (error) {
    console.error("Error fetching course with details unauth:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch course" });
  }
};

export const addSubsectionsToSection = async (req, res) => {
  try {
    const sectionId = Number(req.params.sectionId);
    const { subSections: subSectionsData } = req.body;

    if (!Array.isArray(subSectionsData) || subSectionsData.length === 0) {
      return res.status(400).json({ success: false, message: 'No subsections provided' });
    }

    // Get the max order for subsections in this section
    const existingSubSections = await db
      .select({ order: subSections.order })
      .from(subSections)
      .where(eq(subSections.section_id, sectionId));
    
    let nextOrder = existingSubSections.length > 0 
      ? Math.max(...existingSubSections.map(s => s.order)) + 1
      : 0;

    let newSubsections = [];
    for (const sub of subSectionsData) {
      // Extract YouTube video ID if youtube_video_url is provided
      const youtubeVideoId = sub.youtube_video_url ? extractYouTubeVideoId(sub.youtube_video_url) : null;
      
      let temp = {
        name: sub.name,
        type: sub.type,
        file_url: sub.file_url,
        youtube_video_url: youtubeVideoId ? sub.youtube_video_url : null,
        is_free: youtubeVideoId ? true : (sub.is_free || false),
        section_id: sectionId,
        order: nextOrder++,
      }
      // Fetch and include the video length if the file is a video (only for Bunny videos)
      if (sub.type === "video" && !youtubeVideoId) {
        try {
          temp["duration"] = await getVideoLength(sub.file_url);
        } catch (err) {
          console.log("Error fetching video duration for video id: ", sub.file_url);
          temp["duration"] = "";
        }
      } else {
        temp["duration"] = "";
      }
      newSubsections.push(temp);
    }

    // const newSubsections = subSectionsData.map((sub) => ({
    //   name: sub.name,
    //   file_url: sub.file_url,
    //   type: sub.type,
    //   section_id: sectionId,
    // }));

    await db.insert(subSections).values(newSubsections);

    return res.status(201).json({
      success: true,
      message: 'Subsections added successfully',
    });

  } catch (error) {
    console.error('Error adding subsections:', error);
    return res.status(500).json({ success: false, message: 'Failed to add subsections' });
  }
};

export const activateOrDeactivateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be a boolean' });
    }

    const result = await db
      .update(courses)
      .set({
        is_active,
        updated_at: new Date(),
      })
      .where(eq(courses.id, courseId));

    if (result.numUpdatedRows === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    logger.info(`Course ${courseId} ${is_active ? 'activated' : 'deactivated'} by user ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: `Course ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error activating/deactivating course:', error);
    return res.status(500).json({ success: false, message: 'Failed to update course status' });
  }
}


// Reorder sections within a course
export const reorderSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'sectionOrders must be a non-empty array of { id, order }' 
      });
    }

    // Update each section's order
    for (const section of sectionOrders) {
      await db
        .update(sections)
        .set({ 
          order: section.order,
          updated_at: new Date() 
        })
        .where(eq(sections.id, section.id));
    }

    return res.status(200).json({
      success: true,
      message: 'Sections reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to reorder sections' 
    });
  }
};

// Reorder subsections within a section
export const reorderSubSections = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { subSectionOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(subSectionOrders) || subSectionOrders.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'subSectionOrders must be a non-empty array of { id, order }' 
      });
    }

    // Update each subsection's order
    for (const subSection of subSectionOrders) {
      await db
        .update(subSections)
        .set({ 
          order: subSection.order,
          updated_at: new Date() 
        })
        .where(eq(subSections.id, subSection.id));
    }

    return res.status(200).json({
      success: true,
      message: 'Subsections reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering subsections:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to reorder subsections' 
    });
  }
};

/**
 * Bulk update subsections to mark them as free or paid
 * Endpoint: PUT /api/courses/bulk-update-free-status
 * Body: { subsectionIds: [1, 2, 3], is_free: true }
 */
export const bulkUpdateFreeStatus = async (req, res) => {
  try {
    const { subsectionIds, is_free } = req.body;

    if (!Array.isArray(subsectionIds) || subsectionIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'subsectionIds must be a non-empty array' 
      });
    }

    if (typeof is_free !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'is_free must be a boolean' 
      });
    }

    // Update all subsections in the array
    for (const subsectionId of subsectionIds) {
      await db
        .update(subSections)
        .set({ 
          is_free,
          updated_at: new Date() 
        })
        .where(eq(subSections.id, subsectionId));
    }

    return res.status(200).json({
      success: true,
      message: `${subsectionIds.length} subsection(s) updated successfully`,
    });
  } catch (error) {
    console.error('Error bulk updating free status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to bulk update free status' 
    });
  }
};


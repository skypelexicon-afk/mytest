import { db } from "../db/client.js";
import { eq, and, desc, inArray } from 'drizzle-orm';
import { bundles, bundleCourses, courses } from '../schema/schema.js';
import logger from '../utils/logger.js';

export const createBundle = async (req, res) => {
    try {
        const {
            title,
            description,
            hero_image,
            bundle_price,
            original_price,
            discount_label,
            courseIds, // array of course IDs
        } = req.body;

        const educatorId = req.user.id;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ error: "courseIds must be a non-empty array" });
        }

        // Insert into bundles
        const [newBundle] = await db
            .insert(bundles)
            .values({
                title,
                description,
                hero_image,
                bundle_price,
                original_price,
                discount_label,
                educator_id: educatorId,
            })
            .returning();

        // Insert bundleCourses
        const bundleCourseData = courseIds.map((courseId) => ({
            bundle_id: newBundle.id,
            course_id: courseId,
        }));

        await db.insert(bundleCourses).values(bundleCourseData);

        logger.info(`New bundle with bundle id ${newBundle.id} created by user id ${req.user.id}`);
        res.status(201).json({
            message: "Bundle created successfully",
            bundle: newBundle,
        });
    } catch (err) {
        console.error("Error creating bundle: ", err);
        res.status(500).json({ message: "Failed to create bundle." });
    }
}

export const getAllBundles = async (req, res) => {
    try {
        const allBundles = await db
            .select()
            .from(bundles)
            .where(eq(bundles.is_active, true));

        const bundleIds = allBundles.map((b) => b.id);

        const bundleCourseMappings = await db
            .select()
            .from(bundleCourses)
            .where(inArray(bundleCourses.bundle_id, bundleIds));

        const courseIds = bundleCourseMappings.map((bc) => bc.course_id);

        const coursesInBundles = await db
            .select()
            .from(courses)
            .where(inArray(courses.id, courseIds)); // ✅ fixed

        // Group courses by bundle_id
        const bundleMap = allBundles.map((bundle) => {
            const courseMappings = bundleCourseMappings.filter(
                (bc) => bc.bundle_id === bundle.id
            );
            const bundleCoursesList = courseMappings.map((bc) =>
                coursesInBundles.find((course) => course.id === bc.course_id)
            );
            return {
                ...bundle,
                courses: bundleCoursesList,
            };
        });

        res.status(200).json({
            bundles: bundleMap,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching bundles" });
    }
};

// export const getAllBundleCards = async (req, res) => {

//   try {
//     // 1. Get all active bundles
//     const allBundles = await db
//       .select()
//       .from(bundles)
//       .where(eq(bundles.is_active, true));

//     const bundleIds = allBundles.map((b) => b.id);

//     // 2. Count courses per bundle
//     const courseCounts = await db
//       .select({
//         bundle_id: bundleCourses.bundle_id,
//         totalCourses: count(),
//       })
//       .from(bundleCourses)
//       .where(inArray(bundleCourses.bundle_id, bundleIds))
//       .groupBy(bundleCourses.bundle_id);

//     // 3. Map counts to bundle info
//     const bundleCards = allBundles.map((bundle) => {
//       const match = courseCounts.find((c) => c.bundle_id === bundle.id);
//       return {
//         id: bundle.id,
//         title: bundle.title,
//         description: bundle.description,
//         hero_image: bundle.hero_image,
//         bundle_price: bundle.bundle_price,
//         original_price: bundle.original_price,
//         discount_label: bundle.discount_label,
//         total_courses: match ? match.totalCourses : 0,
//       };
//     });

//     return res.status(200).json({ bundles: bundleCards });
//   } catch (err) {
//     console.error("Error fetching bundle cards:", err);
//     return res.status(500).json({ error: "Failed to fetch bundle cards" });
//   }
// };

export const getBundleById = async (req, res) => {
  try {
    const bundleId = Number(req.params.id);
    if (isNaN(bundleId)) {
      return res.status(400).json({ error: "Invalid bundle ID" });
    }

    const [bundle] = await db
      .select()
      .from(bundles)
      .where(eq(bundles.id, bundleId));

    if (!bundle) {
      return res.status(404).json({ error: "Bundle not found" });
    }

  
    const courseMappings = await db
      .select()
      .from(bundleCourses)
      .where(eq(bundleCourses.bundle_id, bundleId));

    const courseIds = courseMappings.map((bc) => bc.course_id);

  
    const coursesInBundle =
      courseIds.length > 0
        ? await db
            .select()
            .from(courses)
            .where(inArray(courses.id, courseIds))
        : [];

    const bundleWithCourses = {
      ...bundle,
      courses: coursesInBundle,
    };

    res.status(200).json({ bundle: bundleWithCourses });
  } catch (err) {
    console.error("Error fetching bundle by ID:", err);
    res.status(500).json({ error: "Failed to fetch bundle" });
  }
};
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/client.js";
import { users, orders, courses, bundleCourses, bundles, cart, cartCourses, orderItems } from "../schema/schema.js";
import { eq, count, sum, desc, sql, and, inArray, or, isNotNull } from "drizzle-orm";
import logger from "../utils/logger.js";
import { sendPasswordResetEmail, sendVerificationCode, sendWelcomeEmail } from "../middlewares/email.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Register a new user
export const register = async (req, res) => {
  const { name, email, password, phone, address, university, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = uuidv4();

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      university,
      role,
      verification_code: verificationCode,
    });

    // Send verification email
    sendVerificationCode(email, verificationCode);
    console.log(verificationCode);

    logger.info(`New user registered: ${email} with role: ${role}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code, email } = req.body;

  if (!code || !email) {
    return res.status(400).json({ error: "Missing verification code or email" });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.verification_code, code)
        )
      )
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found or already verified" });
    }

    await db
      .update(users)
      .set({
        is_verified: true,
        verification_code: null,
      })
      .where(eq(users.id, user.id));

    logger.info(`Email verified for user: ${user.email}`);
    sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetPassword = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(resetPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    // Send password reset email
    await sendPasswordResetEmail(email, resetPassword);

    logger.info(`Password reset requested for user: ${email}`);
    res.status(200).json({ message: "Password reset code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send password reset code" });
  }
}

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("user:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Old Password:", oldPassword);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, user.id));

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};


// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const newSecretUser = crypto.getRandomValues(new Uint8Array(32)).toString("hex");

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        secret_user: newSecretUser,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        secret_user: newSecretUser,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    await db
      .update(users)
      .set({
        refresh_token: refreshToken,
        secret_user: newSecretUser,
        is_logged_in: true,
      })
      .where(eq(users.id, user.id));

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info(`User logged in: ${email}`);
    res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};


export const logout = async (req, res) => {
  const userId = req.user.id;

  if (userId) {
    // Invalidate the session by nullifying refresh_token and rotating secret_user
    await db
      .update(users)
      .set({
        refresh_token: null,
        secret_user: crypto.randomBytes(32).toString("hex"), // force logout on other tabs/devices
      })
      .where(eq(users.id, userId));
  }

  logger.info(`User logged out: ${userId}`);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({ message: "Logged out successfully" });
};


export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Token:", refreshToken);


  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    const checker = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("Checker:", checker);

    // 1. Fetch user by id
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, checker.id))
      .limit(1);

    console.log('User:', user);
    const newSecret = user.secret_user

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // const newSecretUser = crypto.getRandomValues(new Uint8Array(32)).toString("hex");
    // 2. Update is_logged_in to true
    await db
      .update(users)
      .set({ is_logged_in: true })
      .where(eq(users.id, user.id));
    console.log("is_logged_in set to true for user:", user.id);

    // 3. Create new access token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        secret_user: newSecret,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        secret_user: newSecret,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // await db
    //   .update(users)
    //   .set({
    //     refresh_token: refreshToken,
    //   })
    //   .where(eq(users.id, user.id));
    // 4. Set new cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("Access token renewed New Access Token:", newAccessToken);

    logger.info(`Access token refreshed for user: ${user.email}`);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    try {
      const expiredToken = jwt.decode(refreshToken);
      if (expiredToken?.id) {
        await db
          .update(users)
          .set({ refresh_token: null, is_logged_in: false, secret_user: crypto.randomBytes(32).toString("hex") }) // force logout on other tabs/devices
          .where(eq(users.id, expiredToken.id));

        logger.info(`Refresh token expired. User logged out: ${expiredToken.id}`);
      }
    } catch (decodeErr) {
      console.error("Failed to decode expired refresh token", decodeErr);
    }

    res.status(401).json({ error: "Token refresh failed" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {

    if (!req.user?.id) {

      return res.status(400).json({ error: "User ID is missing from token" });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user.length) {
      console.warn("No user found for ID:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }
    //success data
    console.log("User :", user[0]);
    res.json({ user: user[0] });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const getProfileAll = async (req, res) => {
  if (!req.user?.id) {

    return res.status(400).json({ error: "User ID is missing from token" });
  }
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      with: {

        orders: true,
        carts: true,
      },
    })
    for (const order of user.orders) {
      if (order.course_id) {
        order.course = await db.query.courses.findFirst({
          where: eq(courses.id, order.course_id),
        });
      }

      if (order.bundle_id) {
        order.bundle = await db.query.bundles.findFirst({
          where: eq(bundles.id, order.bundle_id),
        });
      }
    }

    if (!user) {
      console.warn("No user found for ID:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }
    //success data
    console.log("User :", user);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { name, email, phone, address, university, password } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(university && { university }),
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found or no changes made" });
    }

    logger.info(`User profile updated for ID ${userId} by ${email || "Email not provided"}`);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

//order
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const myOrders = await db
      .select({
        order_id: orders.id,
        transaction_id: orders.transaction_id,
        status: orders.status,
        order_amount: orders.order_amount,
        tax_amount: orders.tax_amount,
        discount_amount: orders.discount_amount,
        net_amount: orders.net_amount,
        created_at: orders.created_at,

        order_item_id: orderItems.id,
        course_id: orderItems.course_id,
        course_title: courses.title,
        course_image: courses.image,

        bundle_id: orderItems.bundle_id,
        bundle_title: bundles.title,
        bundle_image: bundles.hero_image,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.order_id, orders.id))
      .leftJoin(courses, eq(orderItems.course_id, courses.id))
      .leftJoin(bundles, eq(orderItems.bundle_id, bundles.id))
      .where(and(eq(orders.user_id, userId), eq(orders.status, "processed")))
      .orderBy(desc(orders.created_at));

    res.status(200).json({ orders: myOrders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};



// user courses



export const getMyCourses = async (req, res) => {
  try {
    // Give access to all courses to some users
    if (req.user.email === "srijandatta868@gmail.com" || req.user.email === "sandipan18vk@gmail.com" || req.user.email === "tendingtoinfinitydevelopers@gmail.com") {
      const all = await db.select().from(courses);
      return res.status(200).json({ courses: all });
    }

    const userId = req.user.id;

    // Step 1: Get all course & bundle purchases
    const orderItemsRows = await db
      .select({
        orderItem: orderItems,
        order: orders
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .where(
        and(
          eq(orders.user_id, userId),
          eq(orders.status, "processed")
        )
      );
    // console.log("Order Items Rows:", orderItemsRows);

    // filter courseIds or bundle Ids from orderItemsRows
    const courseIds = orderItemsRows
      .filter(item => item.orderItem.course_id !== null)
      .map(item => item.orderItem.course_id);

    const bundleIds = orderItemsRows
      .filter(item => item.orderItem.bundle_id !== null)
      .map(item => item.orderItem.bundle_id);

    console.log("Course IDs:", courseIds);
    console.log("Bundle IDs:", bundleIds);

    let bundleCourseIds = [];
    if (bundleIds.length) {
      console.log("Fetching bundle courses for IDs:", bundleIds);

      const bcRows = await db
        .select({ course_id: bundleCourses.course_id })
        .from(bundleCourses)
        .where(inArray(bundleCourses.bundle_id, bundleIds));
      console.log("Bundle Course Rows:", bcRows);

      bundleCourseIds = bcRows.map(bc => bc.course_id);
    }

    console.log("Bundle Course IDs:", bundleCourseIds);


    // Step 4: Merge and deduplicate all course IDs
    const allCourseIds = [...new Set([...courseIds, ...bundleCourseIds])];


    let allCourses = [];

    if (allCourseIds.length > 0) {
      console.log("Fetching courses for IDs:", allCourseIds);

      allCourses = await db
        .select()
        .from(courses)
        .where(inArray(courses.id, allCourseIds));
    }

    return res.status(200).json({ courses: allCourses });
  } catch (err) {
    console.error("Error fetching my courses:", err);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
};





// Get courses created by the educator
export const getMyCreatedCourses = async (req, res) => {
  try {
    // Allow only educators or super admins
    if (req.user.role !== "educator" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Access denied. Only educators can view their courses." });
    }

    const createdCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.educator_id, req.user.id));

    res.status(200).json({ courses: createdCourses });
  } catch (err) {
    console.error("Error fetching educator's courses:", err);
    res.status(500).json({ error: "Failed to fetch your courses" });
  }
};
//Get courses created by the educator
export const getEnrollments = async (req, res) => {
  try {
    // Allow only educators or super admins
    if (req.user.role !== "educator" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Access denied. Only educators can view enrollments." });
    }

    const enrollmentsViaCourse = await db
      .select({
        course_id: courses.id,
        course_title: courses.title,
        educator_id: courses.educator_id,
        purchase_type: sql`'direct'`.as('purchase_type'),
        student_id: orders.user_id,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .innerJoin(users, eq(orders.user_id, users.id))
      .innerJoin(courses, eq(orderItems.course_id, courses.id))
      .where(
        and(
          eq(courses.educator_id, req.user.id), // only courses created by the educator
          eq(orders.status, 'processed')       // only successful orders
        )
      );

    const enrollmentsViaBundle = await db
      .select({
        course_id: courses.id,
        course_title: courses.title,
        educator_id: courses.educator_id,
        purchase_type: sql`'bundle'`.as('purchase_type'),
        student_id: orders.user_id,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.order_id, orders.id))
      .innerJoin(users, eq(orders.user_id, users.id))
      .innerJoin(bundles, eq(orderItems.bundle_id, bundles.id))
      .innerJoin(bundleCourses, eq(orderItems.bundle_id, bundleCourses.bundle_id))
      .innerJoin(courses, eq(bundleCourses.course_id, courses.id))
      .where(
        and(
          isNotNull(orderItems.bundle_id),       // only bundles
          eq(orders.status, 'processed'),       // only successful orders
          eq(courses.educator_id, req.user.id)  // only courses created by the educator
        )
      );
    const allEnrollments = [...enrollmentsViaCourse, ...enrollmentsViaBundle];

    const groupedByCourse = allEnrollments.reduce((acc, curr) => {
      const { course_id, course_title, purchase_type, student_id } = curr;

      if (!acc[course_id]) {
        acc[course_id] = {
          course_id,
          course_title,
          direct_count: 0,
          bundle_count: 0,
          student_ids: new Set(), // Keep track of unique student IDs
        };
      }

      // Avoid duplicate count of same student (per course)
      if (!acc[course_id].student_ids.has(student_id)) {
        acc[course_id].student_ids.add(student_id);

        if (purchase_type === 'direct') {
          acc[course_id].direct_count++;
        } else {
          acc[course_id].bundle_count++;
        }
      }

      return acc;
    }, {});

    // Convert to array and KEEP student_ids as an array (optional conversion from Set)
    const result = Object.values(groupedByCourse).map(course => ({
      ...course,
      student_ids: Array.from(course.student_ids), // if you want it as array instead of Set
    }));

    console.log(result);

    res.status(200).json({ enrollments: result });
  } catch (err) {
    console.error("Error fetching educator's enrollments:", err);
    res.status(500).json({ error: "Failed to fetch your enrollments" });
  }
}

// Get enrollments in courses created by all
export const getEnrollmentsAll = async (req, res) => {
  try {
    // 1️⃣ How many items are in each order?
    const orderItemCounts = await db
      .select({
        order_id: orderItems.order_id,
        item_count: sql`COUNT(*)`,
      })
      .from(orderItems)
      .groupBy(orderItems.order_id);

    const orderItemCountMap = new Map();
    orderItemCounts.forEach(row => {
      orderItemCountMap.set(row.order_id, Number(row.item_count));
    });

    // 2️⃣ How many courses per bundle?
    const bundleCourseCounts = await db
      .select({
        bundle_id: bundleCourses.bundle_id,
        course_count: sql`COUNT(*)`,
      })
      .from(bundleCourses)
      .groupBy(bundleCourses.bundle_id);

    const bundleCourseCountMap = new Map();
    bundleCourseCounts.forEach(row => {
      bundleCourseCountMap.set(row.bundle_id, Number(row.course_count));
    });

    // 3️⃣ Direct course enrollments
    const enrollmentsViaCourse = await db
      .select({
        order_id: orders.id,
        course_id: courses.id,
        course_title: courses.title,
        educator_id: courses.educator_id,
        educator_name: courses.educatorName,
        student_id: orders.user_id,
        order_price: orders.order_amount,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.order_id))
      .innerJoin(users, eq(orders.user_id, users.id))
      .innerJoin(courses, eq(orderItems.course_id, courses.id))
      .where(
        and(
          isNotNull(orderItems.course_id),
          eq(orders.status, "processed")
        )
      );

    // 4️⃣ Bundle enrollments
    const enrollmentsViaBundle = await db
      .select({
        order_id: orders.id,
        course_id: courses.id,
        course_title: courses.title,
        educator_id: courses.educator_id,
        educator_name: courses.educatorName,
        student_id: orders.user_id,
        bundle_id: bundles.id,
        order_price: orders.order_amount,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.order_id))
      .innerJoin(users, eq(orders.user_id, users.id))
      .innerJoin(bundles, eq(orderItems.bundle_id, bundles.id))
      .innerJoin(bundleCourses, eq(orderItems.bundle_id, bundleCourses.bundle_id))
      .innerJoin(courses, eq(bundleCourses.course_id, courses.id))
      .where(
        and(
          isNotNull(orderItems.bundle_id),
          eq(orders.status, "processed")
        )
      );

    // 5️⃣ Compute income per course
    const groupedByCourse = {};

    // Direct courses
    for (const e of enrollmentsViaCourse) {
      const {
        order_id,
        course_id,
        course_title,
        educator_id,
        educator_name,
        student_id,
        order_price,
      } = e;

      if (!groupedByCourse[course_id]) {
        const itemCount = orderItemCountMap.get(order_id) ?? 1;
        groupedByCourse[course_id] = {
          course_id,
          course_title,
          educator_id,
          educator_name,
          direct_count: 0,
          bundle_count: 0,
          total_amount: 0,
          student_ids: new Set(),
        };
      }

      const courseData = groupedByCourse[course_id];

      if (!courseData.student_ids.has(student_id)) {
        courseData.student_ids.add(student_id);
        courseData.direct_count++;

        const itemCount = orderItemCountMap.get(order_id) ?? 1;
        const income = (order_price / 100) / itemCount; // per-course share
        const taxedIncome = income - ((income * 0.02) + (income * 0.02 * 0.18));
        courseData.total_amount += taxedIncome;
      }
    }

    // Bundles
    for (const e of enrollmentsViaBundle) {
      const {
        order_id,
        course_id,
        course_title,
        educator_id,
        educator_name,
        student_id,
        bundle_id,
        order_price,
      } = e;

      if (!groupedByCourse[course_id]) {
        const itemCount = orderItemCountMap.get(order_id) ?? 1; // total items in order
        const coursesInBundle = bundleCourseCountMap.get(bundle_id) ?? 1;
        groupedByCourse[course_id] = {
          course_id,
          course_title,
          educator_id,
          educator_name,
          direct_count: 0,
          bundle_count: 0,
          total_amount: 0,
          student_ids: new Set(),
        };
      }

      const courseData = groupedByCourse[course_id];

      if (!courseData.student_ids.has(student_id)) {
        courseData.student_ids.add(student_id);
        courseData.bundle_count++;

        const itemCount = orderItemCountMap.get(order_id) ?? 1; // total items in order
        const coursesInBundle = bundleCourseCountMap.get(bundle_id) ?? 1;
        const income = (order_price / 100) / (itemCount * coursesInBundle);
        const taxedIncome = income - ((income * 0.02) + (income * 0.02 * 0.18));
        courseData.total_amount += taxedIncome;
      }
    }

    const courseLevelResult = Object.values(groupedByCourse).map(course => ({
      ...course,
      student_ids: Array.from(course.student_ids),
      total_amount: Number(course.total_amount.toFixed(2)), // pretty
    }));

    res.status(200).json({
      enrollments: courseLevelResult,
    });
  } catch (err) {
    console.error("Error fetching income per course:", err);
    res.status(500).json({ error: "Failed to fetch income per course" });
  }
};

// Get admin dashboard data
export const getAdminDashboardData = async (req, res) => {
  try {
    const [
      studentDetails,
      educatorDetails,
      totalRevenueResult,
      bestEducatorResult
    ] = await Promise.all([
      // Student details
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        })
        .from(users)
        .where(eq(users.role, 'student')),

      // Educator details
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          createdCourses: sql`json_agg(json_build_object('id', ${courses.id}, 'name', ${courses.title}))`.as('createdCourses'),
        })
        .from(users)
        .leftJoin(courses, eq(users.id, courses.educator_id))
        .where(eq(users.role, 'educator'))
        .groupBy(users.id),

      // Total order amounts
      db
        .select({
          totalAmount: sum(orders.order_amount)
        })
        .from(orders).where(eq(orders.status, "processed")),

      // Best educator
      db.select({
        educatorId: courses.educator_id,
        educatorName: users.name,
        totalEnrollments: count(orders.id),
      }).from(courses)
        .innerJoin(orderItems, eq(courses.id, orderItems.course_id))
        .innerJoin(users, eq(courses.educator_id, users.id))
        .innerJoin(orders, eq(orders.status, 'processed'))
        .groupBy(courses.educator_id, users.name)
        .orderBy(desc(count(orders.id)))
        .limit(1)
    ]);

    const studentCount = studentDetails.length;
    const educatorCount = educatorDetails.length;

    const totalAmountAll = (Number(totalRevenueResult[0]?.totalAmount) / 100) ?? 0;
    console.log(totalAmountAll);
    const totalAmount = Number((totalAmountAll - ((totalAmountAll * 0.02) + (totalAmountAll * 0.02 * 0.18))).toFixed(2));
    console.log(totalAmount);

    const bestEducator = bestEducatorResult[0] ?? null;

    res.status(200).json({ studentCount, educatorCount, totalAmount, bestEducator, studentDetails, educatorDetails });
  } catch (err) {
    console.error("Error fetching admin dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch admin dashboard data" });
  }
}

export const getWebsiteStats = async (req, res) => {
  try {
    const API_KEY = process.env.GCLOUD_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    const [studentCount, youtubeData] = await Promise.all([
      // Total student count
      db.select({ studentCount: count() }).from(users).where(eq(users.role, "student")),
      // Youtube stats
      fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`)
        .then(res => res.json()),
    ])

    const youtubeStats = youtubeData.items?.[0]?.statistics ?? {};

    res.status(200).json({ totalStudents: studentCount[0].studentCount, youtubeStats })
  } catch (err) {
    console.error("Error fetching website stats:", err);
    res.status(500).json({ error: "Failed to fetch website stats" });
  }
}


// export const getAdmin = async (req, res) => {

//   try {
//     const orderItemCounts = await db
//       .select({
//         order_id: orderItems.order_id,
//         item_count: count(),
//       })
//       .from(orderItems)
//       .groupBy(orderItems.order_id);

//     //[
//     //     { order_id: 1, item_count: 2 },
//     //     { order_id: 2, item_count: 1 },
//     //     ...
//     // ]

//     // Getting the count of courses in each bundle
//     const bundleCourseCounts = await db
//       .select({
//         order_item_id: orderItems.id,
//         course_count: count(),
//       })
//       .from(orderItems)
//       .innerJoin(bundleCourses, eq(orderItems.bundle_id, bundleCourses.bundle_id))
//       .where(orderItems.bundle_id.isNotNull())
//       .groupBy(orderItems.id)




//   } catch (error) {
//     console.error("Error fetching admin data:", error);
//     res.status(500).json({ error: "Failed to fetch admin data" });

//   }

// }
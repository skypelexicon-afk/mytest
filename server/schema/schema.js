import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  pgEnum,
  boolean,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { One, sql } from "drizzle-orm";

// Enums
export const roles = pgEnum("role", ["super_admin", "educator", "student", "staff"]);
export const contentTypeEnum = pgEnum("content_type", ["attachment", "video", "code_file"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processed", "canceled"]);
export const testStatusEnum = pgEnum("test_status", ["draft", "published", "archived"]);
export const questionTypeEnum = pgEnum("question_type", ["mcq", "multiple_correct", "true_false", "numerical"]);
export const examStatusEnum = pgEnum("exam_status", ["in_progress", "submitted", "completed"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 13 }).notNull(),
  address: text("address").notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  university: text("university").notNull(),
  role: roles("role").notNull(),

  refresh_token: text("refresh_token"),
  secret_user: text("secret_user").notNull().default(""),
  is_verified: boolean("is_verified").default(false),
  verification_code: text("verification_code"),

  is_logged_in: boolean("is_logged_in").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  image: text("image").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  target: text("target").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),

  educatorName: text("educator_name"),
  educatorImage: text("educator_image"),
  demoVideos: text("demo_videos").array(),
  is_active: boolean("is_active").default(true),

  contents: text("contents").array().notNull().default(sql`ARRAY[]::text[]`),
  faqs: jsonb("faqs").notNull().default(sql`'[]'::jsonb`),

  originalPrice: integer("original_price").notNull(),
  discountLabel: text("discount_label").notNull(),
  educator_id: integer("educator_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});


// Sections
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),//attachment, video, code_file
  // type: contentTypeEnum("type").notNull(),
  // file_url: text("file_url").notNull(),
  course_id: integer("course_id").notNull().references(() => courses.id),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Sub-sections
export const subSections = pgTable("sub_sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  file_url: text("file_url").notNull(),
  type: contentTypeEnum("type").notNull(),
  duration: text("duration"),
  youtube_video_url: text("youtube_video_url"),
  is_free: boolean("is_free").default(false),
  section_id: integer("section_id").notNull().references(() => sections.id),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
// Free PDFs
export const freePdf = pgTable("freePdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  file_url: text("file_url").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})
// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  transaction_id: text("transaction_id").notNull(), // Generated during payment
  user_id: integer("user_id").notNull().references(() => users.id),
  // course_id: integer("course_id").references(() => courses.id),
  // bundle_id: integer("bundle_id").references(() => bundles.id),
  // cart_id: integer("cart_id").references(() => cart.id),
  // orderItems_id: integer("order_items_id").references(() => orderItems.id),
  status: orderStatusEnum("status").notNull(),
  order_amount: doublePrecision("order_amount").notNull(),
  tax_amount: doublePrecision("tax_amount").notNull(),
  discount_amount: doublePrecision("discount_amount").notNull(),
  invoice_num: text("invoice_num"),
  net_amount: doublePrecision("net_amount").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  course_id: integer("course_id").references(() => courses.id),
  bundle_id: integer("bundle_id").references(() => bundles.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})
// Coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  coupon_code: text("coupon_code").notNull(),
  discount: integer("discount").notNull(),
  max_availability: integer("max_availability").notNull(),
  course_id: integer("course_id").references(() => courses.id),
  bundle_id: integer("bundle_id").references(() => bundles.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  course_id: integer("course_id").notNull().references(() => courses.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Forum
export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  upload: text("upload"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// FAQs
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),


  course_id: integer("course_id").notNull().references(() => courses.id),
  educator_id: integer("educator_id").notNull().references(() => users.id),

  question: text("question").notNull(),
  answer: text("answer").notNull(),
  approved: boolean("approved").default(false),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

//Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  pinned: boolean("pinned").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const generalAnnouncements = pgTable("general_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  pinned: boolean("pinned").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const bundles = pgTable("bundles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  hero_image: text("hero_image"),

  bundle_price: integer("bundle_price").notNull(),
  original_price: integer("original_price").notNull(),
  discount_label: text("discount_label"),

  educator_id: integer("educator_id").notNull().references(() => users.id),

  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const bundleCourses = pgTable("bundle_courses", {
  id: serial("id").primaryKey(),
  bundle_id: integer("bundle_id").notNull().references(() => bundles.id, { onDelete: "cascade" }),
  course_id: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  added_at: timestamp("added_at").notNull().defaultNow(),
});

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  added_at: timestamp("added_at").notNull().defaultNow(),
});

export const cartCourses = pgTable("cart_courses", {
  id: serial("id").primaryKey(),
  cart_id: integer("cart_id").notNull().references(() => cart.id, { onDelete: "cascade" }),
  course_id: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  added_at: timestamp("added_at").notNull().defaultNow(),
});

// Subsection Progress
export const subsectionProgress = pgTable("subsection_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subsection_id: integer("subsection_id").notNull().references(() => subSections.id, { onDelete: "cascade" }),
  is_completed: boolean("is_completed").notNull().default(false),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Streaks
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  current_streak: integer("current_streak").notNull().default(0),
  longest_streak: integer("longest_streak").notNull().default(0),
  last_activity_date: timestamp("last_activity_date"),
  freeze_used: boolean("freeze_used").notNull().default(false),
  total_active_days: integer("total_active_days").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  badge_name: text("badge_name").notNull(),
  description: text("description").notNull(),
  milestone_days: integer("milestone_days").notNull().unique(),
  badge_shape: text("badge_shape").notNull(),
  animation_type: text("animation_type").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// User Badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badge_id: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earned_at: timestamp("earned_at").notNull().defaultNow(),
  is_new: boolean("is_new").notNull().default(true),
});

// Streak History
export const streakHistory = pgTable("streak_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activity_date: timestamp("activity_date").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// ==================== EXAM/TEST PORTAL TABLES ====================

// Tests
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // in minutes
  total_marks: integer("total_marks").notNull(),
  num_questions: integer("num_questions").notNull(),
  description: text("description"),
  instructions: text("instructions"), // Editable NTA-style instructions
  status: testStatusEnum("status").notNull().default("draft"),
  created_by: integer("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  test_id: integer("test_id").notNull().references(() => tests.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  question_type: questionTypeEnum("question_type").notNull(), // mcq, multiple_correct, true_false, numerical
  options: jsonb("options"), // Array of options for MCQ/Multiple Correct/True-False
  correct_answers: jsonb("correct_answers").notNull(), // Array for multiple correct, single value for others
  marks: integer("marks").notNull().default(1),
  negative_marks: doublePrecision("negative_marks").default(0),
  explanation: text("explanation"), // Optional explanation for answer
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Exam Sessions (for student attempts)
export const examSessions = pgTable("exam_sessions", {
  id: serial("id").primaryKey(),
  test_id: integer("test_id").notNull().references(() => tests.id),
  student_id: integer("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  answers: jsonb("answers"), // Store all answers as JSON
  marked_for_review: jsonb("marked_for_review"), // Question IDs marked for review
  start_time: timestamp("start_time").notNull().defaultNow(),
  end_time: timestamp("end_time"),
  score: doublePrecision("score"),
  status: examStatusEnum("status").notNull().default("in_progress"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Relations ////////////////////////////////////////////////////////////////////////
import { relations } from "drizzle-orm";

export const courseRelations = relations(courses, ({ many }) => ({
  sections: many(sections),
  faqs: many(faqs, {
    fields: [faqs.course_id],
    references: [courses.id],
  }),
  announcements: many(announcements, {
    fields: [announcements.course_id],
    references: [courses.id],
  }),
  bundleCourses: many(bundleCourses),
  cartCourses: many(cartCourses),
}));

export const sectionRelations = relations(sections, ({ many, one }) => ({
  course: one(courses, {
    fields: [sections.course_id],
    references: [courses.id],
  }),
  subSections: many(subSections),
}));

export const subSectionRelations = relations(subSections, ({ one }) => ({
  section: one(sections, {
    fields: [subSections.section_id],
    references: [sections.id],
  }),
}));

export const faqRelations = relations(faqs, ({ one }) => ({
  course: one(courses, {
    fields: [faqs.course_id],
    references: [courses.id],
  })
}))

export const announcementRelations = relations(announcements, ({ one }) => ({
  course: one(courses, {
    fields: [announcements.course_id],
    references: [courses.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  
  orders: many(orders, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  reviews: many(reviews, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
  forums: many(forums, {
    fields: [forums.user_id],
    references: [users.id],
  }),
  carts: many(cart, {
    fields: [cart.user_id],
    references: [users.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  orderItems: many(orderItems, {
    fields: [orders.id], // this is the key correction
    references: [orderItems.order_id],
  }),
}));


export const bundleCoursesRelations = relations(bundleCourses, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleCourses.bundle_id],
    references: [bundles.id],
  }),
  course: one(courses, {
    fields: [bundleCourses.course_id],
    references: [courses.id],
  }),
}));

export const bundleRelations = relations(bundles, ({ many }) => ({
  bundleCourses: many(bundleCourses),
}));

export const cartRelations = relations(cart, ({ one,many }) => ({
  user: one(users, {
    fields: [cart.user_id],
    references: [users.id],
  }),
  cartCourses: many(cartCourses, {
    fields: [cartCourses.cart_id],
    references: [cart.id],
  }),
}))

export const cartCoursesRelations = relations(cartCourses, ({ one }) => ({
  cart: one(cart, {
    fields: [cartCourses.cart_id],
    references: [cart.id],
  }),
  course: one(courses, {
    fields: [cartCourses.course_id],
    references: [courses.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  course: one(courses, {
    fields: [orderItems.course_id],
    references: [courses.id],
  }),
  bundle: one(bundles, {
    fields: [orderItems.bundle_id],
    references: [bundles.id],
  }),
}));

export const subsectionProgressRelations = relations(subsectionProgress, ({ one }) => ({
  user: one(users, {
    fields: [subsectionProgress.user_id],
    references: [users.id],
  }),
  subsection: one(subSections, {
    fields: [subsectionProgress.subsection_id],
    references: [subSections.id],
  }),
}));

export const streakRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.user_id],
    references: [users.id],
  }),
}));

export const badgeRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.user_id],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badge_id],
    references: [badges.id],
  }),
}));

export const streakHistoryRelations = relations(streakHistory, ({ one }) => ({
  user: one(users, {
    fields: [streakHistory.user_id],
    references: [users.id],
  }),
}));

// Test Relations
export const testRelations = relations(tests, ({ one, many }) => ({
  creator: one(users, {
    fields: [tests.created_by],
    references: [users.id],
  }),
  questions: many(questions),
  examSessions: many(examSessions),
}));

export const questionRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.test_id],
    references: [tests.id],
  }),
}));

export const examSessionRelations = relations(examSessions, ({ one }) => ({
  test: one(tests, {
    fields: [examSessions.test_id],
    references: [tests.id],
  }),
  student: one(users, {
    fields: [examSessions.student_id],
    references: [users.id],
  }),
}));
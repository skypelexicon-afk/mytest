import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from 'socket.io';

import router from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import OrderRouter from "./routes/orderRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import ForumRouter from "./routes/forumRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import faqRouter from "./routes/faqRoutes.js";
import bundleRouter from "./routes/bundleRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import pdfRouter from "./routes/freePDFRoutes.js";
import progressRouter from "./routes/progressRoutes.js";
import razorpaywhRoutes from "./webhooks/razorpay-wh.js";
import notificationRouter from "./routes/notificationRoutes.js";
import anncRouter from "./routes/genAnnouncementRoutes.js";
import streakRouter from "./routes/streakRoutes.js";
import testRouter from "./routes/testRoutes.js";
import questionRouter from "./routes/questionRoutes.js";


dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:4000', 'http://localhost:5173', 'https://tending-to-infinity-website.onrender.com', "http://20.244.27.212:4000", "https://tendingtoinfinityacademy.com", "https://www.tendingtoinfinityacademy.com"];

// Track active users
const server = createServer(app);
const io = new Server(server, {
  path: "/api/active-users",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("activeUsers", activeUsers);

  console.log(`User connected. Active users: ${activeUsers}`);

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("activeUsers", activeUsers);
    console.log(`User disconnected. Active users: ${activeUsers}`);
  });
});

// Define the Razorpay webhook route before using json parser
app.use("/api/rzp", razorpaywhRoutes)

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS: ", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  exposedHeaders: ['x-rtb-fingerprint-id'],
  credentials: true
}));

app.get("/api/", (req, res) => {
  res.json({ message: "Server is up and running!" });
})
app.use("/api/users", router);
app.use("/api/courses", courseRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/forum", ForumRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/faqs", faqRouter);//only admin can approve faq
app.use("/api/bundle", bundleRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/free-pdfs", pdfRouter);
app.use("/api/progress", progressRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/general-announcements", anncRouter);
app.use("/api/streaks", streakRouter);
app.use("/api/tests", testRouter);
app.use("/api/questions", questionRouter);

// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`Express + Socket.IO running on http://localhost:${PORT}`)
);
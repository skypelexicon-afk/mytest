import jwt from "jsonwebtoken";
import { db } from "../db/client.js";
import { users } from "../schema/schema.js";
import { eq } from "drizzle-orm";

const auth = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id, secret_user } = decoded;

    // Fetch user from DB
    const dbUser = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!dbUser.length || dbUser[0].secret_user !== secret_user) {
      return res.status(401).json({ error: "Session invalidated. Please log in again." });
    }

    // Attach user info to request for later use
    req.user = {
      id: dbUser[0].id,
      email: dbUser[0].email,
      role: dbUser[0].role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default auth;

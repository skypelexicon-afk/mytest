import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js"; // your Drizzle DB instance
import { orders, users, orderItems, courses, bundles } from "../schema/schema.js";

function getTimeDifference(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);

    // Difference in milliseconds
    const diffMs = now - created;

    // Convert to days and hours
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    return { days, hours };
}

export async function getRecentOrders(req, res) {
    try {
        const results = await db
            .select({
                orderId: orders.id,
                transactionId: orders.transaction_id,
                status: orders.status,
                createdAt: orders.created_at,
                userName: users.name, // assumes your users table has 'name'
                orderAmount: orders.order_amount,
                courseId: orderItems.course_id,
                bundleId: orderItems.bundle_id,
                courseTitle: courses.title,
                bundleTitle: bundles.title,
            })
            .from(orders)
            .where(eq(orders.status, "processed"))
            .leftJoin(users, eq(orders.user_id, users.id))
            .leftJoin(orderItems, eq(orderItems.order_id, orders.id))
            .leftJoin(courses, eq(orderItems.course_id, courses.id))
            .leftJoin(bundles, eq(orderItems.bundle_id, bundles.id))
            .orderBy(desc(orders.created_at))
            .limit(10);

        // Format results for clarity
        const formatted = results.map((row) => ({
            userName: row.userName,
            createdAt: row.createdAt,
            itemId: row.courseId || row.bundleId || 0,
            itemTitle: row.courseTitle || row.bundleTitle || "Unknown",
            itemType: row.courseTitle ? "course" : row.bundleTitle ? "bundle" : "unknown",
        }));

        const recentOrders = formatted.map((ord) => {
            const { days, hours } = getTimeDifference(ord.createdAt);
            return {
                ...ord,
                days,
                hours
            }
        })
        res.status(200).json({ recentOrders, success: true });
    } catch (err) {
        console.log("Error fetching recent orders: ", err);
        res.status(500).json({ recentOrders: [], success: false })
    }
}

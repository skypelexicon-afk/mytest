import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { coupons } from "../schema/schema.js";
import logger from "../utils/logger.js";
//
export const createCoupon = async (req, res) => {
    const { coupon_code, discount, max_availability, course_id, bundle_id } = req.body;
    let arr = [];
    try {
        // course_id is an array use for each
        if (course_id) {
            for (let i = 0; i < course_id.length; i++) {
                const newCoupon = await db.insert(coupons).values({
                    coupon_code,
                    discount,
                    max_availability,
                    course_id: course_id[i],
                    bundle_id
                }).returning();

                arr.push(newCoupon);

            }
        } else {
            for (let i = 0; i < bundle_id.length; i++) {
                const newCoupon = await db.insert(coupons).values({
                    coupon_code,
                    discount,
                    max_availability,
                    course_id,
                    bundle_id: bundle_id[i]
                }).returning();

                arr.push(newCoupon);
            }
        }

        //     bundle_id
        // }).returning();
        logger.info("Coupon created successfully:", arr);
        res.status(201).json(arr);
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCoupon = await db.delete(coupons).where(eq(coupons.id, id));
        logger.info("Coupon deleted successfully:", deletedCoupon);
        res.status(200).json(deletedCoupon);
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const verifyCouponCode = async (req, res) => {
    const { coupon_code, course_id, bundle_id } = req.body;

    try {
        let coupon = null;
        // Check if the coupon code exists
        if (course_id) {
            coupon = await db.select()
                .from(coupons)
                .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.course_id, course_id))).limit(1);
        }

        if (bundle_id) {
            coupon = await db.select()
                .from(coupons)
                .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.bundle_id, bundle_id))).limit(1);
        }

        if (coupon.length === 0) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        // Check if the coupon is still valid
        if (coupon.max_availability <= 0) {
            return res.status(400).json({ error: "Coupon has reached its usage limit" });
        }
        res.status(200).json({ valid: true, discount: coupon[0].discount });
    } catch (error) {
        console.error("Error verifying coupon code:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
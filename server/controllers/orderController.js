import { db } from "../db/client.js";
import { orders } from "../schema/schema.js";
import { coupons } from "../schema/schema.js";
import logger from "../utils/logger.js";


export const createOrder = async (req, res) => {
  const {
    transaction_id,
    course_id,
    bundle_id,
    cart_id,
    status,
    order_amount,
    tax_amount,
    discount_amount,
    net_amount,
  } = req.body;

  try {
    const identifiers = [course_id, bundle_id, cart_id].filter(Boolean);
    if (identifiers.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Exactly one of course_id, bundle_id, or cart_id must be provided',
      });
    }
    const result = await db.insert(orders).values({
      transaction_id,
      course_id,
      bundle_id,
      cart_id,
      user_id: req.user.id,
      status,
      order_amount,
      tax_amount,
      discount_amount,
      net_amount,
    }).returning();
    logger.info(`New order created by user ID ${req.user.id} for course ID ${course_id}`);
    res.status(201).json({ order: result[0] });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};



export const createCoupon = async (req, res) => {
  try {
    const { coupon_code, valid_till, max_availability, course_id } = req.body;

    const result = await db.insert(coupons).values({
      coupon_code,
      valid_till: new Date(valid_till),
      max_availability,
      course_id,
    }).returning();

    res.status(201).json({ coupon: result[0] });
  } catch (err) {
    console.error("Error creating coupon: ", err);
    res.status(500).json({ error: "Coupon creation failed" });
  }
};

import { eq } from "drizzle-orm";

// GET all orders (optionally filter by user or course)
export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await db
      .select()
      .from(orders);

    if (!allOrders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({ orders: allOrders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// DELETE an order by ID
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(orders).where(eq(orders.id, Number(id))).returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Order not found or already deleted" });
    }

    res.status(200).json({ message: "Order deleted successfully", order: deleted[0] });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
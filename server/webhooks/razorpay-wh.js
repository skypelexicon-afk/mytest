import express from "express";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import bodyParser from "body-parser";
import logger from "../utils/logger.js";
import { db } from "../db/client.js";
import { and, eq } from 'drizzle-orm';
import { orders } from '../schema/schema.js';
import { processPayment } from "../utils/payment.js";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateOrderInfo = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const body = req.body.toString("utf8"); // raw body buffer

        // Verify signature
        const isValid = validateWebhookSignature(
            body,
            signature,
            RAZORPAY_WEBHOOK_SECRET
        );

        if (!isValid) {
            console.warn("Invalid Razorpay webhook signature");
            return res.status(400).send("Invalid signature");
        }

        // Send OK when the request is verified to avoid getting disabled
        console.log("Sending success status to razorpay webhook");
        res.status(200).send("Webhook received");

        const eventData = JSON.parse(body);
        const { event, payload } = eventData;

        console.log("waiting for 15 seconds before processing razorpay webhook event...");
        await sleep(15000); // wait for 15 seconds to ensure data consistency
        console.log("Wait over");

        switch (event) {
            case "order.paid": {
                const payment = payload.payment.entity;
                const order = payload.order.entity;
                // console.log("Payment entity: ", payment);
                const { id: razorpay_order_id } = order;
                const { id: razorpay_payment_id } = payment;
                const { user_id, order_id, course_id, bundle_id, cart_id, coupon_code } = payment.notes;
                console.log(`Payment notes for payment id ${razorpay_payment_id}: `, user_id, order_id, course_id, bundle_id, cart_id, coupon_code);
                console.log(`Payment ${razorpay_payment_id} paid for user id ${user_id}`);
                logger.info(`Payment ${razorpay_payment_id} paid for user id ${user_id}`);

                // Check if the order is already processed
                const existingOrder = await db.select().from(orders).where(and(eq(orders.id, order_id), eq(orders.status, 'processed'))).limit(1);
                if (existingOrder.length > 0) {
                    console.log(`Order ID ${order_id} is already processed with controller.`);
                    break;
                } else {
                    // Call the payment function to update order info
                    console.log(`Processing order ID ${order_id} for the first time.`);
                    await processPayment(
                        razorpay_order_id,
                        razorpay_payment_id,
                        user_id,
                        order_id,
                        course_id,
                        bundle_id,
                        cart_id,
                        coupon_code
                    );
                }

                break;
            }
            default:
                console.log("Unhandled razorpay event:", event);
        }
        console.log("Sending confirmation for razorpay webhook...");
        res.status(200).send("Webhook received");
    } catch (err) {
        console.error("Error processing Razorpay webhook:", err);
        res.status(500).send("Server error");
    }
}

const razorpaywhRoutes = express.Router();
razorpaywhRoutes.post("/webhook", bodyParser.raw({ type: "application/json" }), updateOrderInfo)
export default razorpaywhRoutes;
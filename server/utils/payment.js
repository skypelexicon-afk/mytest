import { bundles, cart, cartCourses, coupons, courses, orders, users } from '../schema/schema.js';
import { db } from '../db/client.js';
import { sendOrderConfirmationEmail } from '../middlewares/email.js';
import { and, eq, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

export const processPayment = async (
    razorpay_order_id,
    razorpay_payment_id,
    user_id,
    order_id,
    course_id,
    bundle_id,
    cart_id,
    coupon_code) => {
    console.log("Payment processing function called from webhook");
    try {

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        const identifiers = [course_id, bundle_id, cart_id].filter(Boolean);
        if (identifiers.length !== 1) {
            return res.status(400).json({
                success: false,
                message: 'Exactly one of course_id, bundle_id, or cart_id must be provided',
            });
        }

        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${order_id}`;
        const [newOrder] = await db
            .update(orders)
            .set({
                transaction_id: razorpay_payment_id,
                status: 'processed',
                invoice_num: invoiceNumber
            })
            .where(and(eq(orders.user_id, user_id), eq(orders.id, order_id)))
            .returning({ id: orders.id, price: orders.order_amount, createdAt: orders.created_at });

        if (coupon_code) {
            try {

                let coupon = null;

                if (course_id) {
                    coupon = await db.select()
                        .from(coupons)
                        .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.course_id, course_id))).limit(1);

                    await db
                        .update(coupons)
                        .set({
                            max_availability: coupon[0].max_availability - 1
                        })
                        .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.course_id, course_id)));
                }

                if (bundle_id) {
                    coupon = await db.select()
                        .from(coupons)
                        .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.bundle_id, bundle_id))).limit(1);

                    await db
                        .update(coupons)
                        .set({
                            max_availability: coupon[0].max_availability - 1
                        })
                        .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.bundle_id, bundle_id)));
                }
            } catch (err) {
                console.log(err);
                console.log(`Coupon max availability could not be updated for coupon code: ${coupon_code} courseID: ${course_id} bundleID: ${bundle_id}`);
                logger.info(`Coupon max availability could not be updated for coupon code: ${coupon_code} courseID: ${course_id} bundleID: ${bundle_id}`);
            }
        }

        console.log(`Order with ID: ${order_id} updated for user ID: ${user_id}`);
        console.log(`New Order Details:`, newOrder);
        const emailUser = await db.select({
            email: users.email,
            name: users.name,
            role: users.role
        })
            .from(users)
            .where(eq(users.id, user_id))

        if (course_id) {
            const course = await db
                .select({ id: courses.id, title: courses.title, price: courses.price })
                .from(courses)
                .where(eq(courses.id, course_id))
                .limit(1);

            if (!course || course.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found',
                });
            }
            console.log(`Course details for course_id ${course_id}:`, course);
            sendOrderConfirmationEmail(
                emailUser[0],
                razorpay_order_id,
                invoiceNumber,
                order_id,
                course,
                newOrder.price
            )
        } else if (bundle_id) {
            const bundle = await db
                .select({ id: bundles.id, title: bundles.title, price: bundles.bundle_price })
                .from(bundles)
                .where(eq(bundles.id, bundle_id))
                .limit(1);

            if (!bundle || bundle.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Bundle not found',
                });
            }
            console.log(`Bundle details for bundle_id ${bundle_id}:`, bundle);

            sendOrderConfirmationEmail(
                emailUser[0],
                razorpay_order_id,
                invoiceNumber,
                order_id,
                bundle,
                newOrder.price
            )
        } else if (cart_id) {
            const cart_items = await db
                .select({
                    id: cart.id,
                    cart_courses: sql`
            json_agg(
              json_build_object(
                'id', ${courses.id},
                'title', ${courses.title},
                'price', ${courses.price}
              )
            )
          `
                })
                .from(cart)
                .innerJoin(cartCourses, eq(cart.id, cartCourses.cart_id))
                .innerJoin(courses, eq(cartCourses.course_id, courses.id))
                .where(eq(cart.id, cart_id))
                .groupBy(cart.id)

            // console.log(`Cart items for cart_id ${cart_id}:`, cart_items);
            console.log(
                "Cart items for cart_id", cart_id,
                JSON.stringify(cart_items, null, 2)
            );

            const items = cart_items[0].cart_courses

            console.log(items);



            if (!cart_items || cart_items.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found',
                });
            }
            sendOrderConfirmationEmail(
                emailUser[0],
                razorpay_order_id,
                invoiceNumber,
                order_id,
                items,
                newOrder.price
            )
        }

        // Clear cart after payment
        if (cart_id)
            await db.delete(cartCourses).where(eq(cartCourses.cart_id, cart_id));

        logger.info(`Payment verified and order saved for user ID ${user_id} with transaction ID ${razorpay_payment_id}`);
    } catch (error) {
        console.error('Error saving order:', error);
        const failedOrder = await db
            .update(orders)
            .set({
                status: 'canceled',
            })
            .where(and(eq(orders.user_id, req.user.id), eq(orders.id, req.body.order_id)))


        logger.error(`Payment verification failed for user ID ${req.user.id} with transaction ID ${razorpay_payment_id}: ${error.message}`);
    }
}

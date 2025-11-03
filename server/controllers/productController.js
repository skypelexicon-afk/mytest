import { razorpay } from '../utils/razorpay.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { bundles, cart, cartCourses, coupons, courses, orderItems, orders, users } from '../schema/schema.js';
import { db } from '../db/client.js';
import { sendOrderConfirmationEmail } from '../middlewares/email.js';
import { and, eq, sql } from 'drizzle-orm';


dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { course_id, cart_id, bundle_id, coupon_code, currency = 'INR', receipt } = req.body;


    console.log("Coupon Code:", coupon_code);

    const identifiers = [course_id, bundle_id, cart_id].filter(Boolean);
    if (identifiers.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Exactly one of course_id, bundle_id, or cart_id must be provided',
      });
    }


    let percent = 0;
    let gst = 0;
    let totalTax = 0;
    let newDecreasedAmount = 0;
    let amount = 0;
    console.log(`Creating Razorpay order with course_id: ${course_id}, bundle_id: ${bundle_id}, cart_id: ${cart_id}, currency: ${currency}, receipt: ${receipt}`);
    const platformFee = parseInt(process.env.PLATFORM_FEE);
    // const platformFee = process.env.PLATFORM_FEE;
    let netAmount = 0;
    let discount = 0;
    if (course_id) {
      const course = await db
        .select({ id: courses.id, title: courses.title, price: courses.price })
        .from(courses)
        .where(eq(courses.id, course_id))
        .limit(1)


      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }
      netAmount = course[0].price + platformFee; // Adding platform fee of 3

      // Apply coupon discount if available
      if (coupon_code) {
        const coupon = await db
          .select()
          .from(coupons)
          .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.course_id, course_id)))
          .limit(1);

        if (coupon && coupon[0].max_availability > 0) {

          netAmount = course[0].price * (100 - coupon[0].discount) / 100 + platformFee;
        }
      }


      //Razorpay taxes
      percent = netAmount * 0.02;
      gst = percent * 0.18;
      totalTax = percent + gst;

      newDecreasedAmount -= totalTax;

      console.log(`Course total amount: ${netAmount}`);
    } else if (bundle_id) {
      console.log(`Fetching bundle with ID: ${bundle_id}`);

      const bundle = await db
        .select({ id: bundles.id, title: bundles.title, price: bundles.bundle_price })
        .from(bundles)
        .where(eq(bundles.id, bundle_id))
        .limit(1)


      if (!bundle) {
        return res.status(404).json({
          success: false,
          message: 'Bundle not found',
        });
      }
      netAmount = bundle[0].price + platformFee; // Adding platform fee of 3
      console.log(coupon_code);

      if (coupon_code) {
        const coupon = await db
          .select()
          .from(coupons)
          .where(and(eq(coupons.coupon_code, coupon_code), eq(coupons.bundle_id, bundle_id)))
          .limit(1);

        if (coupon[0].max_availability > 0 && coupon) {
          netAmount = bundle[0].price * (100 - coupon[0].discount) / 100 + platformFee;
        }
      }
      console.log(`Bundle coupon code: ${coupon_code}`);
      console.log(`New Amount: ${netAmount}`);

      percent = netAmount * 0.02;
      gst = percent * 0.18;
      totalTax = percent + gst;

      newDecreasedAmount -= totalTax;

      console.log(`Bundle total amount: ${netAmount}`);
    } else if (cart_id) {
      const cartCoursesTable = await db
        .select({ course_id: cartCourses.course_id, price: courses.price })
        .from(cartCourses)
        .innerJoin(courses, eq(cartCourses.course_id, courses.id))
        .where(eq(cartCourses.cart_id, cart_id));

      if (cartCoursesTable.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart is empty or not found',
        });
      }
      amount = cartCoursesTable.reduce((total, item) => total + item.price, 0);

      let discountPercentage = 0;
      if (cartCoursesTable.length > 1) {
        if (amount >= 950 && amount <= 1450) {
          discountPercentage = 10;
        } else if (amount >= 1451 && amount <= 1950) {
          discountPercentage = 12;
        } else if (amount > 1950) {
          discountPercentage = 15;
        }
      }
      discount = (amount * discountPercentage) / 100;
      netAmount = (amount + platformFee - discount);
      percent = netAmount * 0.02;
      gst = percent * 0.18;
      totalTax = percent + gst;

      newDecreasedAmount -= totalTax;
      console.log(`Cart total amount: ${amount}, Discount: ${discount}, Platform Fee: ${platformFee}, Net Amount: ${netAmount}`);

    }


    const [uId] = await db.insert(orders).values({
      user_id: req.user.id,
      transaction_id: "", // This will be updated after payment
      course_id: course_id,
      bundle_id: bundle_id,
      cart_id: cart_id,
      order_amount: Math.round(netAmount * 100),
      tax_amount: 3,
      discount_amount: newDecreasedAmount * 100,
      net_amount: Math.round(netAmount * 100),
      status: 'pending',

    }).returning({ id: orders.id });

    console.log(`Order created with ID: ${uId} for user ID: ${req.user.id}`);

    const options = {
      amount: Math.round(netAmount * 100),
      currency: "INR",
      receipt: receipt || `receipt_order_${Date.now()}`,
      notes: {
        user_id: req.user.id,
        order_id: uId.id,
        course_id: course_id,
        bundle_id: bundle_id,
        cart_id: cart_id,
        coupon_code: coupon_code
      }
    };

    // Storing order items in DB

    if (course_id) {
      await db.insert(orderItems).values({
        order_id: uId.id,
        course_id,
      });
      console.log(`Course with ID: ${course_id} added to order ID: ${uId.id}`);

    } else if (bundle_id) {
      await db.insert(orderItems).values({
        order_id: uId.id,
        bundle_id,
      });
      console.log(`Bundle with ID: ${bundle_id} added to order ID: ${uId.id}`);
    } else if (cart_id) {
      console.log(cart_id);

      const cartCoursesTable = await db
        .select()
        .from(cartCourses)
        .where(eq(cartCourses.cart_id, cart_id));

      console.log("Cart Courses:", cartCoursesTable);
      const courseInsertions = cartCoursesTable.map((item) => ({
        order_id: uId.id,
        course_id: item.course_id,
      }));

      await db.insert(orderItems).values(courseInsertions);
    }

    const order = await razorpay.orders.create(options);

    console.log("Order created successfully:", order);


    logger.info(`Razorpay order created: ${JSON.stringify(order)} for UserID: ${req.user.id}`);
    return res.status(200).json({ success: true, order, id: uId, amount: netAmount });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    logger.error(`Razorpay order creation failed for UserID: ${req.user.id}`)
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
};

export const getKey = async (req, res) => {
  res.status(200).json({ key: process.env.RAZOR_API_KEY });
}



export const verifyRazorpaySignature = (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZOR_API_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (generatedSignature === razorpay_signature) {
    next();
  } else {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
};

export const payment = async (req, res) => {
  console.log("This is the payment processing function called from frontend");
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      course_id, // You need to pass this from frontend
      bundle_id,
      cart_id, // You need to pass this from frontend
      user_id,
      order_id,
      coupon_code
    } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Check if the order is already processed
    const existingOrder = await db.select().from(orders).where(and(eq(orders.id, order_id), eq(orders.status, 'processed'))).limit(1);
    if (existingOrder.length > 0) {
      console.log(`Order ID ${order_id} is already processed with webhook.`);
      return res.status(200).json({
        success: true,
        message: 'Payment verified and order saved',
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
    return res.status(200).json({
      success: true,
      message: 'Payment verified and order saved',
    });
  } catch (error) {
    console.error('Error saving order:', error);
    const failedOrder = await db
      .update(orders)
      .set({
        status: 'canceled',
      })
      .where(and(eq(orders.user_id, req.user.id), eq(orders.id, req.body.order_id)))


    logger.error(`Payment verification failed for user ID ${req.user.id} with transaction ID ${razorpay_payment_id}: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Payment verified but order insertion failed',
    });
  }
}

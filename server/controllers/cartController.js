import { db } from "../db/client.js";
import { courses, sections, bundleCourses, users, cart, cartCourses } from "../schema/schema.js";

import { and, eq } from "drizzle-orm";

export const updateCart = async (req , res) => {
  try {
    // Check if user already has a cart
    const userId = req.user.id;
    const course_id = req.body.course_id;
    let existingCart = await db
      .select()
      .from(cart)
      .where(eq(cart.user_id, userId))
      .limit(1);

    let cartId;
    if (existingCart.length > 0) {
      cartId = existingCart[0].id;
    } else {
      const newCart = await db.insert(cart).values({ user_id: userId }).returning({ id: cart.id });
      cartId = newCart[0].id;
    }

    // Check if course already in cart
    const alreadyInCart = await db
      .select()
      .from(cartCourses)
      .where(and(eq(cartCourses.cart_id, cartId), eq(cartCourses.course_id, course_id)));

    if (alreadyInCart.length > 0) {
      return res.status(409).json({ message: "Course already in cart" });
    }

    // Insert course into cartCourses
    await db.insert(cartCourses).values({
      cart_id: cartId,
      course_id,
    });

    return res.status(201).json({ message: "Course added to cart successfully" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: "course_id is required" });
    }

    // Find existing cart for user
    const existingCart = await db
      .select()
      .from(cart)
      .where(eq(cart.user_id, userId))
      .limit(1);

    if (!existingCart.length) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    const cartId = existingCart[0].id;

    // Delete the course from cartCourses
    const deleteResult = await db
      .delete(cartCourses)
      .where(and(eq(cartCourses.cart_id, cartId), eq(cartCourses.course_id, course_id)));

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "Course not found in cart" });
    }

    return res.status(200).json({ message: "Course removed from cart successfully" });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartWithCourses = await db.query.cart.findFirst({
      where: eq(cart.user_id, Number(userId)),
      with: {
        cartCourses: {
          with: {
            course: true,
          },
        },
      },
    });

    if (!cartWithCourses) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cartWithCourses.cartCourses);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
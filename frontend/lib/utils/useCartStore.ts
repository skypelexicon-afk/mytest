import { create } from 'zustand';
import { CartItem } from '../api/Courses';

type CartState = {
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  total: () => number;
};

// export const useCartStore = create<CartState>((set, get) => ({
//   cart: [],

//   // Set entire cart from DB/API
//   setCart: (items) => set({ cart: items }),

//   // Add a new cart item if it's not already in cart
//  addToCart: (item) => {
//   const courseId = item.course[0]?.id;
//   // if cart is null or empty, add the item
//   if (!get().cart || get().cart.length === 0) {
//     set((state) => ({ cart: [...state.cart, item] }));
//     return;
//   }
//   const exists = get().cart.some((c) =>
//     c.course.some((singleCourse) => singleCourse.id === courseId)
//   );
//   if (!exists) {
//     set((state) => ({ cart: [...state.cart, item] }));
//   }
// },

  // Remove item by cart ID (you can also use course.id if needed)
//   removeFromCart: (id) =>
//     set((state) => ({
//       cart: state.cart.filter((item) => item.id !== id),
//     })),

//   // Clear the cart
//   clearCart: () => set({ cart: [] }),

//   // Compute total price
//   total: () =>
//     get().cart.reduce((sum, item) => sum + item.course.map((c) => c.price).reduce((a, b) => a + b, 0), 0),
// }));

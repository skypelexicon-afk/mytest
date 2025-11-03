import express from 'express';
import { deleteCartItem, getCartItems, updateCart } from '../controllers/cartController.js';
import auth from '../middlewares/auth.js';

const cartRoutes = express.Router();

cartRoutes.post('/create', auth, updateCart);
cartRoutes.delete('/delete', auth, deleteCartItem);
cartRoutes.get('/', auth, getCartItems);

export default cartRoutes;
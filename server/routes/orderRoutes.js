import express from 'express';
import { createOrder, createCoupon, getAllOrders, deleteOrder } from '../controllers/orderController.js';
import auth from '../middlewares/auth.js'
import { isEducatorOrAdmin } from '../middlewares/checkAdminEdu.js';

const OrderRouter = express.Router();

OrderRouter.post('/orders', auth, createOrder);
OrderRouter.post('/coupons', auth, isEducatorOrAdmin, createCoupon);
OrderRouter.get('/orders', auth, isEducatorOrAdmin, getAllOrders);
OrderRouter.delete('/orders/:id', auth, deleteOrder);

export default OrderRouter;

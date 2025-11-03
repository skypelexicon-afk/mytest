import express from 'express';
import { createOrder, getKey, payment, verifyRazorpaySignature } from '../controllers/productController.js';
import auth from '../middlewares/auth.js'


const paymentRouter = express.Router();


paymentRouter.get('/get-key', getKey);
paymentRouter.post('/create-order',auth, createOrder);

paymentRouter.post('/verify-payment',auth, verifyRazorpaySignature, payment);


export default paymentRouter;

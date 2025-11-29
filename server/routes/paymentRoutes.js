import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { confirmOrderPaid, createPaymentIntent } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-intent', userAuth, createPaymentIntent);
paymentRouter.post('/confirm', userAuth, confirmOrderPaid);

export default paymentRouter;



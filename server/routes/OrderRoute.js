import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD } from '../controllers/OrderController.js';
import AuthSeller from '../middleware/AuthSeller.js';
import userAuth from '../middleware/userAuth.js';

const orderRouter = express.Router();

orderRouter.post('/cod',userAuth,placeOrderCOD)
orderRouter.get('/user',userAuth,getUserOrders)
orderRouter.get('/seller',AuthSeller,getAllOrders)


export default orderRouter;
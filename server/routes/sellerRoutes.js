import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout, sellerRegister, verifySellerOtp, sendSellerResetOtp, resetSellerPassword } from '../controllers/sellerController.js';
import AuthSeller from '../middleware/AuthSeller.js';

const sellerRouter = express.Router();


sellerRouter.post("/register", sellerRegister);
sellerRouter.post("/login",sellerLogin);
sellerRouter.post("/verify-otp", verifySellerOtp);
sellerRouter.post("/send-reset-otp", sendSellerResetOtp);
sellerRouter.post("/reset-password", resetSellerPassword);
sellerRouter.get("/is-auth" , AuthSeller , isSellerAuth);
sellerRouter.post("/logout", sellerLogout);


export default sellerRouter; 
import express from "express";
import userAuth from "../middleware/userAuth.js";
import AuthSeller from "../middleware/AuthSeller.js";
import {
  sendMessage,
  getProductMessages,
  getConversations,
  getSellerConversations,
  getSellerProductMessages,
} from "../controllers/messageController.js";

const router = express.Router();

// User routes
router.post("/", userAuth, sendMessage);
router.get("/conversations", userAuth, getConversations);
router.get("/product/:productId/user/:otherUserId", userAuth, getProductMessages);

// Seller routes
router.post("/seller", AuthSeller, sendMessage);
router.get("/seller/conversations", AuthSeller, getSellerConversations);
router.get("/seller/product/:productId/user/:otherUserId", AuthSeller, getSellerProductMessages);

export default router;
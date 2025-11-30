import Message from "../models/Message.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import mongoose from "mongoose";
import { getIO } from "../server.js"; // Import socket.io instance

// Helper function to check database connection
const checkDatabaseConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }

    const { receiverId, productId, content } = req.body;
    const senderId = req.user?.id || req.seller?.id;

    if (!senderId) {
      return res.json({ success: false, message: "Authentication required" });
    }

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Verify receiver is the product seller
    const isSellerSender = !!req.seller;
    const isUserSender = !!req.user;

    // Validate receiver based on sender type
    if (isUserSender) {
      // User → must message product seller
      if (product.seller.toString() !== receiverId) {
        return res.json({ success: false, message: "Invalid receiver for this product" });
      }
    } else if (isSellerSender) {
      // Seller → must own the product
      if (product.seller.toString() !== senderId) {
        return res.json({ success: false, message: "You don't own this product" });
      }
      // Seller can message any user — no restriction needed
    }

    // Determine sender and receiver models
    const senderModel = isUserSender ? 'user' : 'Seller';
    const receiverModel = isUserSender ? 'Seller' : 'user';

    const message = new Message({
      sender: senderId,
      senderModel: senderModel,
      receiver: receiverId,
      receiverModel: receiverModel,
      product: productId,
      content,
    });

    await message.save();

    // Populate sender and receiver for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // Emit message via WebSocket for real-time delivery
    try {
      const io = getIO();
      const roomName = `${productId}-${receiverId}`;
      io.to(roomName).emit('receiveMessage', {
        content,
        senderId,
        senderType: senderModel,
        productId,
        otherUserId: receiverId,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('WebSocket error:', socketError);
    }

    return res.json({ success: true, message: "Message sent", data: populatedMessage });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Get messages for a specific product between user and seller
export const getProductMessages = async (req, res) => {
  try {
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }

    const { productId, otherUserId } = req.params;
    const userId = req.user.id;

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        product: productId,
        sender: otherUserId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all unique product conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }]
        }
      },
      // Sort before grouping so $last picks the true latest message
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$product",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userObjectId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderUser"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderSeller"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverUser"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverSeller"
        }
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$product", 0] },
          sender: {
            $cond: [
              { $gt: [{ $size: "$senderUser" }, 0] },
              { $arrayElemAt: ["$senderUser", 0] },
              { $arrayElemAt: ["$senderSeller", 0] }
            ]
          },
          receiver: {
            $cond: [
              { $gt: [{ $size: "$receiverUser" }, 0] },
              { $arrayElemAt: ["$receiverUser", 0] },
              { $arrayElemAt: ["$receiverSeller", 0] }
            ]
          },
          otherUser: {
            $cond: [
              { $eq: ["$lastMessage.sender", userObjectId] },
              {
                $cond: [
                  { $gt: [{ $size: "$receiverUser" }, 0] },
                  { $arrayElemAt: ["$receiverUser", 0] },
                  { $arrayElemAt: ["$receiverSeller", 0] }
                ]
              },
              {
                $cond: [
                  { $gt: [{ $size: "$senderUser" }, 0] },
                  { $arrayElemAt: ["$senderUser", 0] },
                  { $arrayElemAt: ["$senderSeller", 0] }
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    return res.json({ success: true, data: conversations });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Get all conversations for a seller
export const getSellerConversations = async (req, res) => {
  try {
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }

    const sellerId = req.seller.id;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Get all unique product conversations for this seller
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: sellerObjectId }, { receiver: sellerObjectId }]
        }
      },
      // Sort before grouping so $last picks the true latest message
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { 
            product: "$product",
            otherUser: {
              $cond: [
                { $eq: ["$sender", sellerObjectId] },
                "$receiver",
                "$sender"
              ]
            }
          },
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", sellerObjectId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "otherUserAsUser"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "otherUserAsSeller"
        }
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$product", 0] },
          otherUser: {
            $cond: [
              { $gt: [{ $size: "$otherUserAsUser" }, 0] },
              { $arrayElemAt: ["$otherUserAsUser", 0] },
              { $arrayElemAt: ["$otherUserAsSeller", 0] }
            ]
          }
        }
      },
      {
        $addFields: {
          _id: "$lastMessage._id"
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    // Filter out conversations with missing data
    const validConversations = conversations.filter(conv => 
      conv && conv.product && conv.otherUser && conv.lastMessage
    );

    return res.json({ success: true, data: validConversations });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Get messages for a specific product between seller and user
export const getSellerProductMessages = async (req, res) => {
  try {
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }

    const { productId, otherUserId } = req.params;
    const sellerId = req.seller.id;

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Verify that the seller owns this product
    if (product.seller.toString() !== sellerId) {
      return res.json({ success: false, message: "You don't have permission to view messages for this product" });
    }

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: sellerId, receiver: otherUserId },
        { sender: otherUserId, receiver: sellerId }
      ]
    })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        product: productId,
        sender: otherUserId,
        receiver: sellerId,
        isRead: false
      },
      { isRead: true }
    );

    // Filter out any invalid messages
    const validMessages = messages.filter(msg => 
      msg && msg._id && msg.content && msg.sender && msg.receiver
    );

    return res.json({ success: true, data: validMessages });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
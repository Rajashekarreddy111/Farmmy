import express from "express";
import Newsletter from "../models/Newsletter.js";

const router = express.Router();

// Subscribe to newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res.status(200).json({ success: true, message: "Email already subscribed" });
    }

    // Create new subscription
    const subscription = new Newsletter({ email });
    await subscription.save();

    res.status(201).json({ success: true, message: "Successfully subscribed to newsletter" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
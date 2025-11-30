import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Seller from "../models/Seller.js";
import axios from "axios";

// ✅ REGISTER SELLER
export const sellerRegister = async (req, res) => {
    try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

        const exists = await Seller.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Seller already exists" });

        const hashed = await bcrypt.hash(password, 10);
    const seller = await Seller.create({ name, email, password: hashed });

    // Generate OTP for verification
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    seller.loginOtp = otp;
    seller.loginOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await seller.save();

    // Send OTP via Brevo
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "Farmmy", email: process.env.SENDER_EMAIL },
          to: [{ email }],
          subject: "Verify your email - Farmmy",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #4fbf8b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Welcome to Farmmy Seller Portal!</h1>
              </div>
              <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #eee;">
                <h2 style="color: #333;">Hello ${name},</h2>
                <p>Thank you for registering as a seller with Farmmy. We're excited to have you on board!</p>
                <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #4fbf8b;">Your Verification Code:</h3>
                  <div style="font-size: 32px; font-weight: bold; color: #4fbf8b; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                  </div>
                  <p>This code is valid for 24 hours.</p>
                </div>
                <p>If you didn't create a seller account with us, please ignore this email.</p>
                <p>Best regards,<br/>The Farmmy Team</p>
              </div>
              <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
                <p>© 2025 Farmmy. All rights reserved.</p>
              </div>
            </div>
          `,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (mailError) {
      console.error("Brevo Email Error:", mailError.response?.data || mailError.message);
    }

    return res.json({
      success: true,
      message: "Registration successful! OTP sent to your email.",
    });
    } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ VERIFY OTP
export const verifySellerOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.json({ success: false, message: "Email and OTP required" });

    const seller = await Seller.findOne({ email });
    if (!seller)
      return res.json({ success: false, message: "Seller not found" });

    if (seller.loginOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    if (seller.loginOtpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired" });

    seller.isVerified = true;
    seller.loginOtp = "";
    seller.loginOtpExpireAt = null;
    await seller.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ LOGIN SELLER
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: "All fields required" });

        const seller = await Seller.findOne({ email });
    if (!seller)
      return res.json({ success: false, message: "Seller not found" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    if (!seller.isVerified)
      return res.json({
        success: false,
        message: "Please verify your email before logging in",
      });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
            httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ success: true, message: "Login successful" });
    } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ LOGOUT
export const sellerLogout = (req, res) => {
  try {
    res.clearCookie("sellerToken", {
            httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ SEND RESET OTP
export const sendSellerResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.json({ success: false, message: "Seller not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    seller.loginOtp = otp;
    seller.loginOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await seller.save();

    // Send OTP email (optional)
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "Farmmy", email: process.env.SENDER_EMAIL },
          to: [{ email }],
          subject: "Password Reset OTP - Farmmy",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #4fbf8b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Password Reset</h1>
              </div>
              <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #eee;">
                <h2 style="color: #333;">Hello ${seller.name},</h2>
                <p>You have requested to reset your password. Please use the following verification code:</p>
                <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #4fbf8b;">Your Reset Code:</h3>
                  <div style="font-size: 32px; font-weight: bold; color: #4fbf8b; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                  </div>
                  <p style="color: #e74c3c;"><strong>This code is valid for 10 minutes only.</strong></p>
                </div>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p>Best regards,<br/>The Farmmy Team</p>
              </div>
              <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
                <p>© 2025 Farmmy. All rights reserved.</p>
              </div>
            </div>
          `,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (mailError) {
      console.error("Brevo Email Error:", mailError.response?.data || mailError.message);
    }

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ RESET PASSWORD
export const resetSellerPassword = async (req, res) => {
  try {
    const { email, otp, newpassword } = req.body;

    const seller = await Seller.findOne({ email });
    if (
      !seller ||
      seller.loginOtp !== otp ||
      (seller.loginOtpExpireAt && seller.loginOtpExpireAt < Date.now())
    ) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    seller.password = await bcrypt.hash(newpassword, 10);
    seller.loginOtp = "";
    seller.loginOtpExpireAt = null;
    seller.isVerified = true;
    await seller.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const isSellerAuth = async (req, res) => {
  try {
    return res.json({success: true, sellerId: req.seller.id});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
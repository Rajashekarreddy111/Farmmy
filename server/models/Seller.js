import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    loginOtp: { type: String },
    loginOtpExpireAt: { type: Date },
  },
  { timestamps: true }
);

const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;

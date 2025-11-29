import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function SellerResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("sellerResetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/seller/reset-password", {
        email,
        otp,
        newpassword: newPassword,
      });
      if (data.success) {
        toast.success("Password reset successful");
        localStorage.removeItem("sellerResetEmail");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Seller Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Reset</button>
        </form>
      </div>
    </div>
  );
}

export default SellerResetPassword;



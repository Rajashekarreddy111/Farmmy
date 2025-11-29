import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function SellerVerify() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("sellerVerifyEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/seller/verify-otp", { email, otp });
      if (data.success) {
        toast.success("Seller verified");
        localStorage.removeItem("sellerVerifyEmail");
        navigate("/seller");
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
        <h2>Verify Seller</h2>
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
          <button type="submit" className="btn-primary">Verify</button>
        </form>
      </div>
    </div>
  );
}

export default SellerVerify;

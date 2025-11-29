import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("consumer");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (role === "seller") {
        const { data } = await axios.post("/api/seller/send-reset-otp", { email });
        if (data.success) {
          toast.success(data.message);
          navigate("/resetpassword", { state: { email, role: "seller" } });
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/user/send-reset-otp", { email });
        if (data.success) {
          toast.success(data.message);
          navigate("/resetpassword", { state: { email, role: "consumer" } });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="mr-4">Reset for</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="consumer">Consumer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;

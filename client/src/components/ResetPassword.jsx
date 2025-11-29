import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Email and role from navigation state
  const email = location.state?.email;
  const role = location.state?.role || "consumer";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (role === "seller") {
        const { data } = await axios.post("/api/seller/reset-password", {
          email,
          otp,
          newpassword: newPassword,
        });
        if (data.success) {
          toast.success("Password reset successful");
          navigate("/login");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/user/reset-password", {
          email,
          otp,
          newpassword: newPassword,
        });
        if (data.success) {
          toast.success("Password reset successful");
          navigate("/login");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </span>
          </div>

          <button type="submit" className="btn-primary">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

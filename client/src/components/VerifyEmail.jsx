import React, { useState, useRef } from "react";
import "./Otp.css";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

function VerifyEmail() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const location = useLocation();
  const { email, role } = location.state || {};

  const { navigate } = useAppContext();
  axios.defaults.withCredentials = true;

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (index < 5 && value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // If current field is empty, move to previous field
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        // If current field has value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasteData.every((char) => !isNaN(char))) {
      setOtp((prev) => prev.map((_, i) => pasteData[i] || ""));
      pasteData.forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = char;
        }
      });
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      toast.success(`OTP Submitted: ${enteredOtp}`);
      try {
        if (role === "seller") {
          const { data } = await axios.post("/api/seller/verify-otp", {
            email,
            otp: enteredOtp,
          });
          if (data.success) {
            toast.success(data.message);
            navigate("/login");
          } else {
            toast.error(data.message);
          }
        } else {
          const { data } = await axios.post("/api/user/verify-account", {
            otp: enteredOtp,
          });
          if (data.success) {
            toast.success(data.message);
            navigate("/login");
          } else {
            toast.error(data.message);
          }
        }
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      toast.error("Please enter a valid 6-digit OTP");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>OTP Verification</h2>
        <p>Enter the 6-digit code sent to your email</p>
        <div className="otp-inputs" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={otp[index]}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="verify-btn" onClick={handleSubmit}>
          Verify
        </button>
        <p className="resend-text">
          Didn't receive the code? <span className="resend">Resend</span>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;

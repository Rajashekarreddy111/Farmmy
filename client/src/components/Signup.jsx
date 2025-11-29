import React, { useState } from "react";
import "./Auth.css";
import { useAppContext } from "../context/AppContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Signup() {
  const { setName, setEmail, setPassword, setUser } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [role, setRole] = useState("consumer");
  const [shopName, setShopName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log("Signup Data:", formData);

      const name = formData.firstName + " " + formData.lastName;
      const email = formData.email;
      const password = formData.password;
      axios.defaults.withCredentials = true;
      if (role === "seller") {
        const { data } = await axios.post("/api/seller/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          toast.success("Verification OTP sent");
          navigate("/verifyemail", { state: { email, role: "seller" } });
          return;
        } else {
          toast.error(data.message);
          return;
        }
      } else {
        const { data } = await axios.post("/api/user/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          setName(name);
          setEmail(email);
          setPassword(password);
          setUser(true);
          toast.success(data.message);
          navigate("/verifyemail", { state: { email, role: "consumer" } });
          return;
        } else {
          toast.error(data.message);
          return;
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <Link to="/login" className="non-active">
            Log in
          </Link>
          <span className="active">Sign up</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="mr-4">Register as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="consumer">Consumer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your First name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
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
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

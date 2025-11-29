import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const { setUser, setEmail, setPassword, getUserData, setuser, setisseller } =
    useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [role, setRole] = useState("consumer");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log("Login Data:", formData);

      const email = formData.email;
      const password = formData.password;

      axios.defaults.withCredentials = true;
      const endpoint =
        role === "seller" ? "/api/seller/login" : "/api/user/login";
      const { data } = await axios.post(endpoint, { email, password });

      if (data.success) {
        if (role === "seller") {
          setisseller(true);
          navigate("/seller");
        } else {
          setUser(true);
          setEmail(email);
          setPassword(password);
          getUserData();
          setuser(true);
          navigate("/");
        }
        toast.success("logged in successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <span className="active">Log in</span>
          <Link to="/signup" className="non-active">
            Sign up
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="mr-4">Login as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="consumer">Consumer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label>Your Email</label>
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

          <div className="forgot">
            <Link to="/forgotpassword">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

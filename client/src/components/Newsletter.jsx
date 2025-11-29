import React, { useState } from "react";
import "./Newsletter.css";
import axios from "axios";
import toast from "react-hot-toast";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/newsletter/subscribe", { email });

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail(""); // Clear the input field
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to subscribe to newsletter"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="newsletter-container">
        <h1 className="newsletter-title">Never Miss a Deal!</h1>
        <p className="newsletter-subtitle">
          Subscribe to get the latest offers, new arrivals, and exclusive
          discounts
        </p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            className="newsletter-input"
            type="email"
            placeholder="Enter your email id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="newsletter-button"
            disabled={loading}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Newsletter;

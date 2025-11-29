import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import "./Navbar.css";
import toast from "react-hot-toast";
import axios from "axios";
import farmmylogo from "../assets/farmmylogo.png";

function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const {
    user,
    setuser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getcartcount,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/user/logout");

      if (data.success) {
        toast.success("Logout successful");
        setuser(false);
        navigate("/");
      } else {
        toast.error("Logout failed: " + data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <div>
      <nav className="navbar">
        {/* Logo */}
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img className="navbar-logo" src={farmmylogo} alt="logo" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">All Products</NavLink>
          <NavLink to="/">Contact</NavLink>

          {/* Search bar */}
          <div className="navbar-search">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search products"
              value={searchQuery}
            />
            <img src={assets.search_icon} alt="search" />
          </div>

          {/* Messages Icon */}
          {user && (
            <div
              onClick={() => navigate("/conversations")}
              className="navbar-cart"
            >
              <MessageCircle size={24} className="text-gray-700" />
            </div>
          )}

          {/* Cart Icon */}
          <div onClick={() => navigate("/cart")} className="navbar-cart">
            <img src={assets.nav_cart_icon} alt="cart-icon" />
            <button className="cart-count">{getcartcount()}</button>
          </div>

          {/* User Menu */}
          {!user ? (
            <button onClick={() => navigate("/login")} className="login-btn">
              Login
            </button>
          ) : (
            <div
              className="profile-menu"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              <img src={assets.profile_icon} className="profile-icon" alt="" />
              <ul className={`profile-dropdown ${profileOpen ? "show" : ""}`}>
                <li
                  onClick={() => {
                    navigate("/my-orders");
                    setProfileOpen(false);
                  }}
                >
                  My Orders
                </li>
                <li
                  onClick={() => {
                    navigate("/conversations");
                    setProfileOpen(false);
                  }}
                >
                  Messages
                </li>
                <li
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="navbar-mobile">
          <div onClick={() => navigate("/cart")} className="navbar-cart">
            <img src={assets.nav_cart_icon} alt="cart-icon" />
            <button className="cart-count">{getcartcount()}</button>
          </div>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="menu-btn"
          >
            <img src={assets.menu_icon} alt="menu" />
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="mobile-menu">
            <NavLink to="/" onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              All Products
            </NavLink>
            {user && (
              <NavLink to="/my-orders" onClick={() => setOpen(false)}>
                My Orders
              </NavLink>
            )}
            <NavLink to="/" onClick={() => setOpen(false)}>
              Contact
            </NavLink>

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="login-btn mobile-login"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="login-btn mobile-login"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;

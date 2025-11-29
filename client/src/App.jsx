import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import Allproducts from "./pages/Allproducts";
import Productcategory from "./pages/Productcategory";
import Productdetails from "./pages/Productdetails";
import Cart from "./pages/Cart";
import AddAdress from "./pages/AddAdress";
import MyOrders from "./pages/MyOrders";
import Sellerlogin from "./components/seller/Sellerlogin";
import Sellerlayout from "./pages/seller/Sellerlayout";
import Addproduct from "./pages/seller/Addproduct";
import Productlist from "./pages/seller/Productlist";
import Orders from "./pages/seller/Orders";
import Signup from "./components/Signup";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import SellerResetPassword from "./components/seller/SellerResetPassword.jsx";
import UserChatDashboard from "./pages/UserChatDashboard";
import SellerChatDashboard from "./pages/seller/SellerChatDashboard";

function App() {
  const isSellerPath = useLocation().pathname.startsWith("/seller");
  const isLoginPath =
    useLocation().pathname === "/login" ||
    useLocation().pathname === "/signup" ||
    useLocation().pathname === "/verifyemail" ||
    useLocation().pathname === "/forgotpassword" ||
    useLocation().pathname === "/resetpassword";
  const { isseller, loadingSeller } = useAppContext();
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white w-full">
      {isSellerPath || isLoginPath ? null : <Navbar />}
      <Toaster />
      <div
        className={`${
          isSellerPath ? "" : "px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32"
        } w-full`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Allproducts />} />
          <Route path="/products/:category" element={<Productcategory />} />
          <Route path="/products/:category/:id" element={<Productdetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAdress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/conversations" element={<UserChatDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verifyemail" element={<VerifyEmail />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route
            path="/seller/resetpassword"
            element={<SellerResetPassword />}
          />
          <Route
            path="/seller"
            element={
              loadingSeller ? (
                <div className="flex justify-center items-center h-screen">
                  <p>Checking authentication...</p>
                </div>
              ) : isseller ? (
                <Sellerlayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Addproduct />} />
            <Route path="product-list" element={<Productlist />} />
            <Route path="orders" element={<Orders />} />
            <Route path="conversations" element={<SellerChatDashboard />} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && !isLoginPath && <Footer />}
    </div>
  );
}

export default App;

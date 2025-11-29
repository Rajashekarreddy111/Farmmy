import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setuser] = useState(null);
  const [isseller, setisseller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setproducts] = useState([]);
  const [cartitems, setcartitems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSeller, setLoadingSeller] = useState(true);

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setisseller(true);
      } else {
        setisseller(false);
      }
    } catch (error) {
      setisseller(false);
    } finally {
      setLoadingSeller(false);
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setuser(true);
      } else {
        setuser(false);
      }
    } catch (error) {
      setuser(false);
      toast.error(error.message);
    }
  };

  const fetchproducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.sucess) {
        setproducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addtocart = (itemId) => {
    let cartdata = structuredClone(cartitems);
    if (cartdata[itemId]) {
      cartdata[itemId] += 1;
    } else {
      cartdata[itemId] = 1;
    }
    setcartitems(cartdata);
    toast.success("Added to Cart");
  };

  const updatecartitem = (itemId, quantity) => {
    let cartdata = structuredClone(cartitems);
    cartdata[itemId] = quantity;
    setcartitems(cartdata);
    toast.success("Cart Updated");
  };

  const removefromcart = (itemId) => {
    let cartdata = structuredClone(cartitems);
    if (cartdata[itemId]) {
      cartdata[itemId] -= 1;
      if (cartdata[itemId] === 0) {
        delete cartdata[itemId];
      }
    }
    toast.success("Remove From Cart");
    setcartitems(cartdata);
  };

  const getcartcount = () => {
    let totalcount = 0;
    for (const item in cartitems) {
      totalcount += cartitems[item];
    }
    return totalcount;
  };

  const getcartamount = () => {
    let totalamount = 0;
    for (const items in cartitems) {
      let iteminfo = products.find((product) => product._id === items);
      if (iteminfo && cartitems[items] > 0) {
        totalamount += iteminfo.offerPrice * cartitems[items];
      }
      
    }
    return Math.floor(totalamount * 100) / 100;
  };

  useEffect(() => {
    fetchSeller();
    fetchproducts();
    getAuthState();
  }, []);

  const value = {
    navigate,
    user,
    setuser,
    setisseller,
    isseller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addtocart,
    updatecartitem,
    removefromcart,
    cartitems,
    searchQuery,
    setSearchQuery,
    getcartamount,
    getcartcount,
    axios,
    loadingSeller,
    fetchproducts,
    setUser: setuser,
    setEmail: () => {},
    setPassword: () => {},
    setName: () => {},
    getUserData: () => {},
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
export const useAppContext = () => {
  return useContext(AppContext);
};

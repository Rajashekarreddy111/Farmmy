import React from "react";
import { MessageCircle } from "lucide-react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
const Productcard = ({ product }) => {
  const [count, setCount] = React.useState(0);
  const { currency, addtocart, removefromcart, cartitems, navigate, user } =
    useAppContext();

  const handleMessageClick = async (e) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to message sellers");
      navigate("/login");
      return;
    }

    try {
      // Send a starter message to create conversation
      const response = await axios.post(
        "/api/message",
        {
          receiverId: product.seller,
          productId: product._id,
          content:
            "Hi! I'm interested in this product. Can you tell me more about it?",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Message sent! Opening conversation...");
        // Navigate to conversations and let the component handle finding the right conversation
        navigate("/conversations");
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    product && (
      <div
        onClick={() => {
          navigate(
            `/products/${product.category.toLowerCase()}/${product._id}`
          );
          scrollTo(0, 0);
        }}
        className="border border-gray-500/20 rounded-md px-3 py-2 bg-white min-w-[140px] md:min-w-[200px] w-full max-w-full"
      >
        <div className="group cursor-pointer flex items-center justify-center px-2">
          <img
            className="group-hover:scale-105 transition max-w-[100px] md:max-w-[140px] w-full h-auto object-contain"
            src={product.image[0]}
            alt={product.name}
          />
        </div>
        <div className="text-gray-500/60 text-sm">
          <p className="truncate">{product.category}</p>
          <p className="text-gray-700 font-medium text-base md:text-lg truncate w-full">
            {product.name}
          </p>
          <div className="flex items-center gap-0.5">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  className="w-2.5 md:w-3.5"
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt=""
                />
              ))}
            <p className="text-xs md:text-sm">(4)</p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="flex flex-col">
              <p className="text-base md:text-xl font-medium text-primary">
                {currency} {product.offerPrice}
              </p>
              <span className="text-gray-500/60 text-xs md:text-sm line-through">
                {currency} {product.price}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMessageClick}
                className="flex items-center justify-center w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded cursor-pointer hover:bg-gray-100 transition-colors"
                title="Message seller"
              >
                <MessageCircle
                  size={14}
                  className="text-green-500 md:size-16"
                />
              </button>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-primary"
              >
                {!cartitems[product._id] ? (
                  <button
                    className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-[60px] h-[28px] md:w-[80px] md:h-[34px] rounded cursor-pointer text-xs md:text-sm"
                    onClick={() => addtocart(product._id)}
                  >
                    <img
                      src={assets.cart_icon}
                      alt="carticon"
                      className="w-3 md:w-auto"
                    />
                    Add
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1 md:gap-2 w-[60px] h-[28px] md:w-20 md:h-[34px] bg-primary/25 rounded select-none">
                    <button
                      onClick={() => {
                        removefromcart(product._id);
                      }}
                      className="cursor-pointer text-sm md:text-md px-1 md:px-2 h-full"
                    >
                      -
                    </button>
                    <span className="w-4 md:w-5 text-center text-sm md:text-base">
                      {cartitems[product._id]}
                    </span>
                    <button
                      onClick={() => {
                        addtocart(product._id);
                      }}
                      className="cursor-pointer text-sm md:text-md px-1 md:px-2 h-full"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Productcard;

import React from "react";
import Productcard from "./Productcard";
import { useAppContext } from "../context/AppContext";
import "./Bestseller.css"; // Import external CSS file

function Bestseller() {
  const { products } = useAppContext();
  return (
    <div className="bestseller w-full">
      <p className="bestseller-title text-center md:text-left">Best Seller</p>
      <div className="bestseller-grid">
        {products
          .filter((product) => product.instock)
          .slice(0, 5)
          .map((product, index) => (
            <div key={index} className="flex">
              <Productcard product={product} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default Bestseller;

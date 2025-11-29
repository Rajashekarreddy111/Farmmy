import React from "react";
import Productcard from "./Productcard";
import { useAppContext } from "../context/AppContext";

function Featured() {
  const { products } = useAppContext();
  const featured = products.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary-dull/5 rounded-3xl p-6 md:p-8 shadow-sm w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
        🌟 Featured Picks
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 ">
        {featured.map((product, index) => (
          <div key={index} className="flex">
            <Productcard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Featured;

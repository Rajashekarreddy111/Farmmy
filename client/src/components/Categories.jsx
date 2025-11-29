import React from "react";
import { categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Categories() {
  const { navigate } = useAppContext();
  return (
    <div className="mt-16 w-full">
      <p className="text-2xl md:text-3xl font-medium text-center">Categories</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 mt-6 gap-4 md:gap-6 justify-center">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center min-w-[120px] md:min-w-[140px]"
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            <img
              src={category.image}
              alt={category.text}
              className="max-w-[80px] md:max-w-[100px] h-auto object-contain"
            />
            <p className="text-sm font-medium text-center">{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;

import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function Mainbanner() {
  return (
    <div className="relative w-full">
      <img
        src={assets.main_banner_bg}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt="banner"
        className="w-full md:hidden"
      />
      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-16 md:pb-0 px-4 md:pl-12 lg:pl-16 xl:pl-24">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center md:text-left max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl leading-tight">
          Freshness You Can Trust, Savings You Will Love!{" "}
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link
            to={"/products"}
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 md:px-8 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer"
          >
            Shop now
            <img
              className="md:hidden transition group-focus:translate-x-1"
              src={assets.white_arrow_icon}
              alt="arrow"
            />
          </Link>

          <Link
            to={"/products"}
            className="group hidden md:flex items-center gap-2 px-8 py-3 cursor-pointer"
          >
            explore deals
            <img
              className="transition group-hover:translate-x-1"
              src={assets.black_arrow_icon}
              alt="arrow"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Mainbanner;

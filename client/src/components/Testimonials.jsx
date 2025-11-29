import React from "react";
import { reviews } from "../assets/assets.js";

function Testimonials() {
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-10">
        What Our Customers Say
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-3"
          >
            <p className="text-gray-700 italic">“{review.text}”</p>
            <span className="text-sm font-semibold text-gray-900">
              — {review.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Testimonials;

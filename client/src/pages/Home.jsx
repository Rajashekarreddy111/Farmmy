import React from "react";
import Mainbanner from "../components/Mainbanner";
import Categories from "../components/Categories";
import Bestseller from "../components/Bestseller";
import Bottombanner from "../components/Bottombanner";
import Newsletter from "../components/Newsletter";
import Testimonials from "../components/Testimonials";
import Featured from "../components/Featured";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 mt-6 w-full">
      {" "}
      {/* HERO WITH FULL WIDTH */}{" "}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {" "}
        <Mainbanner />{" "}
      </motion.section>
      {/* HIGHLIGHT CATEGORIES */}
      <motion.section
        className="max-w-7xl mx-auto px-4 md:px-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">Shop by Categories</h2>
          <p className="text-gray-600 mt-2 max-w-xl">
            Find your favourite products faster – browse by category.
          </p>
        </div>
        <Categories />
      </motion.section>
      {/* FEATURED SECTION */}
      <motion.section
        className="max-w-7xl mx-auto px-4 w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Featured />
      </motion.section>
      {/* BESTSELLER */}
      <motion.section
        className="bg-gray-50 rounded-3xl py-12 md:py-16 px-4 md:px-6 shadow-md max-w-7xl mx-auto w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          🔥 Best Sellers
        </h2>
        <Bestseller />
      </motion.section>
      {/* TRUST SECTION */}
      <motion.section
        className="max-w-7xl mx-auto px-4 w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Bottombanner />
      </motion.section>
      {/* TESTIMONIALS */}
      <motion.section
        className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.section>
      {/* NEWSLETTER */}
      <motion.section
        className="bg-white rounded-3xl shadow-lg max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Newsletter />
      </motion.section>
    </div>
  );
}

export default Home;

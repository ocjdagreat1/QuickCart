'use client'
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))
        ) : (
          <p className="text-gray-400 text-sm w-full text-center mt-4">
            Loading products...
          </p>
        )}
      </div>

      <button
        onClick={() => { router.push('/all-products'); window.scrollTo(0, 0); }}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition mt-4"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;

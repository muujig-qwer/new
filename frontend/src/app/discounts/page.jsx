"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext"; // Wishlist context-оо импортлоорой

export default function DiscountsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlist(); // removeFromWishlist-г context-оос авна

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products?discounted=true")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Зөвхөн хямдралтай бараа шүүх (хэрвээ API шууд filter хийдэггүй бол)
  const discountedProducts = products.filter(
    (p) => p.discount && p.discountPrice
  );

  if (loading) {
    return <div className="text-center py-20">Уншиж байна...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Хямдралтай бараанууд <span className="text-red-500">🏷️</span>
        </h1>
        <span className="text-gray-500 text-sm">
          Нийт{" "}
          <span className="font-bold text-green-600">
            {discountedProducts.length}
          </span>{" "}
          бараа
        </span>
      </div>
      {discountedProducts.length === 0 ? (
        <div className="text-gray-400 text-center py-20">
          Одоогоор хямдралтай бараа алга байна.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {discountedProducts.map((product) => {
            const isWished = wishlist.some((w) => w._id === product._id);
            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition group"
              >
                <Link href={`/products/${product._id}`}>
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : product.image
                        ? product.image
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded mb-3 group-hover:scale-105 transition"
                  />
                  <div className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                    {product.name}
                  </div>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-green-700">
                    {product.discountPrice?.toLocaleString()}₮
                  </span>
                  <span className="line-through text-gray-400 text-sm">
                    {product.price?.toLocaleString()}₮
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    onClick={() => addToCart(product)}
                    title="Сагслах"
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    Сагслах
                  </button>
                  <button
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border ${
                      isWished
                        ? "bg-red-100 text-red-600 border-red-200"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                    } transition`}
                    onClick={() =>
                      isWished
                        ? removeFromWishlist(product._id)
                        : addToWishlist(product)
                    }
                    title={isWished ? "Дуртайгаас хасах" : "Дуртайд нэмэх"}
                  >
                    <FaHeart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function DiscountsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        Хямдралтай бараанууд <span className="text-red-500">🏷️</span>
      </h1>
      {discountedProducts.length === 0 ? (
        <div className="text-gray-400 text-center py-20">Одоогоор хямдралтай бараа алга байна.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {discountedProducts.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition"
            >
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image
                    ? product.image
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-full aspect-square object-cover rounded mb-3"
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900">
                  {product.discountPrice?.toLocaleString()}₮
                </span>
                <span className="line-through text-gray-400 text-sm">
                  {product.price?.toLocaleString()}₮
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              </div>
              <div className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
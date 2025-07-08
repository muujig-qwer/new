"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/products?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-700">
        Хайлтын үр дүн: <span className="text-black">"{query}"</span>
      </h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 text-lg py-12">Үр дүн олдсонгүй.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 flex flex-col overflow-hidden"
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={
                    product.images[0].startsWith("http")
                      ? product.images[0]
                      : `/uploads/${product.images[0]}`
                  }
                  alt={product.name}
                  className="w-full h-40 object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                  <span>📦</span>
                </div>
              )}
              <div className="flex-1 flex flex-col p-3">
                <div className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">{product.name}</div>
                <div className="text-green-600 font-bold text-lg mb-1">{product.price?.toLocaleString()}₮</div>
                <div className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</div>
                <a
                  href={`/product/${product._id}`}
                  className="mt-auto inline-block w-full text-center bg-green-600 text-white rounded-lg py-2 px-3 font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  Дэлгэрэнгүй
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

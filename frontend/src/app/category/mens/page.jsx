"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const CATEGORY_ID = "684f88df3756ab9fdd1a7804"; // "Эрэгтэй" category-ийн id

export default function MensCategoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:5000/api/categories").then((res) => setCategories(res.data));
    axios
      .get(`http://localhost:5000/api/products/category/id/${CATEGORY_ID}`)
      .then((res) => setProducts(res.data));
  }, []);

  // Subcategory-уудыг авах
  const subCategories = categories.filter((cat) => cat.parent === CATEGORY_ID);

  // Filter хийх
  const filteredProducts = products.filter((p) => {
    if (selectedSub === "all") return true;
    const catId =
      typeof p.category === "object" && p.category !== null && p.category._id
        ? p.category._id.toString()
        : p.category?.toString?.() || p.category;
    return catId === selectedSub;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      {/* Зүүн талын цэс */}
      <aside className="w-56 shrink-0">
        <div className="bg-white rounded-xl shadow p-4 sticky top-8">
          <h2 className="text-lg font-bold mb-4">Эрэгтэй дэд ангилал</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedSub === "all" ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedSub("all")}
              >
                Бүгд
              </button>
            </li>
            {subCategories.map((cat) => (
              <li key={cat._id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded ${selectedSub === cat._id ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedSub(cat._id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Бүтээгдэхүүний жагсаалт */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Эрэгтэй</h1>
        <div className="mb-4 text-gray-600">
          Нийт <span className="font-bold">{filteredProducts.length}</span> бараа байна.
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-gray-500 text-center py-12">Бүтээгдэхүүн олдсонгүй.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow p-4 flex flex-col">
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
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">{product.name}</h3>
                </Link>
                <div className="mt-auto">
                  {product.discount && product.discountPrice ? (
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-bold text-green-700">
                        {product.discountPrice?.toLocaleString()}₮
                      </span>
                      <span className="line-through text-gray-400 text-xs font-semibold">
                        {product.price?.toLocaleString()}₮
                      </span>
                      <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                        -{product.discount}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {product.price?.toLocaleString()}₮
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )}
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { jwtDecode } from "jwt-decode";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Устгахдаа итгэлтэй байна уу?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Амжилттай устгалаа");
      fetchProducts();
    } catch (err) {
      alert("Устгахад алдаа гарлаа");
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 py-26 px-4"> 
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Бүтээгдэхүүнүүд</h1>
        {isAdmin && (
          <Link
            href="/products/add"
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            + Шинэ бүтээгдэхүүн
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
  key={product._id}
  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col justify-between"
>
  {/* Зураг */}
  {product.images && product.images.length > 0 && (
    <div className="w-full h-48 mb-4 flex gap-2 overflow-x-auto">
      {product.images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={product.name}
          className="h-full object-cover rounded-lg"
          style={{ minWidth: '12rem' }}
        />
      ))}
    </div>
  )}

  {/* Нэр, үнэ */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
    <p className="text-gray-600 mt-1">{product.price?.toLocaleString()}₮</p>
  </div>

  {/* Товчлуурууд */}
  <div className="mt-4 space-y-2">
    <Link
      href={`/products/${product._id}`}
      className="block text-center w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
    >
      Дэлгэрэнгүй
    </Link>

    {isAdmin && (
      <div className="flex gap-2">
        <Link
          href={`/products/edit/${product._id}`}
          className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
        >
          Засах
        </Link>
        <button
          onClick={() => handleDelete(product._id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
        >
          Устгах
        </button>
      </div>
    )}

    <button
      onClick={() => addToCart(product)}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
    >
      🛒 Сагсанд нэмэх
    </button>
  </div>
</div>
        ))}
      </div>
    </div>
  </div>
);

}

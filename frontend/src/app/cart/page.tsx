"use client";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import React from "react";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
};

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart() as {
    cartItems: CartItem[];
    removeFromCart: (id: string, size?: string) => void;
    clearCart: () => void;
  };
  const router = useRouter();
  const { data: session, status } = useSession();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Захиалга хийх
  const handleOrder = async () => {
    if (!session) {
      alert("Зөвхөн нэвтэрсэн хэрэглэгч захиалга хийх боломжтой.");
      router.push("/login");
      return;
    }

    try {
      const products = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        size: item.size,
      }));

      await axios.post(
        "http://localhost:5000/api/orders",
        {
          products,
          totalPrice: total,
          email: session.user.email, // Google login хэрэглэгчийн email
        }
      );
      clearCart();
      router.push("/orders");
    } catch (err) {
      alert("Захиалга үүсгэхэд алдаа гарлаа");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600 mb-4">Сагсаа харахын тулд нэвтэрнэ үү.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Нэвтрэх
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-30 mt-16 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span role="img" aria-label="cart" className="text-4xl">
          🛒
        </span>
        Миний сагс
      </h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow">
          <p className="text-lg">Сагс хоосон байна</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
          >
            Дүүргэж эхлэх
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {cartItems.map((item, idx) => (
              <div
                key={`${item._id}-${item.size || idx}`}
                className="flex items-center gap-5 py-6 px-4 hover:bg-gray-50 transition group"
              >
                {/* Зураг */}
                {item.image && (
                  <img
                    src={
                      item.image.startsWith("http")
                        ? item.image
                        : `http://localhost:5000/uploads/${item.image}`
                    }
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border bg-gray-100"
                    onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  />
                )}

                {/* Барааны мэдээлэл */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-lg truncate">{item.name}</h2>
                    <button
                      onClick={() => removeFromCart(item._id, item.size)}
                      className="text-red-500 hover:bg-red-100 rounded-full p-2 transition opacity-0 group-hover:opacity-100"
                      title="Устгах"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Хэмжээ */}
                    <div className="text-gray-500 text-sm">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {item.size ? `Хэмжээ: ${item.size}` : "Хэмжээ: -" }
                      </span>
                    </div>
                    {/* Үнэ, тоо ширхэг */}
                    <div className="text-gray-700 text-base font-medium">
                      {item.price.toLocaleString()}₮
                      <span className="mx-2 text-gray-400">×</span>
                      {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-8 px-2">
            <div className="font-bold text-xl">Нийт:</div>
            <div className="font-bold text-2xl text-green-700">
              {total.toLocaleString()}₮
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={clearCart}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Сагс хоослох
            </button>
            <button
              onClick={handleOrder}
              className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold shadow transition"
            >
              Захиалах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

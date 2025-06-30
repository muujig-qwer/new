"use client";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaRegCreditCard, FaTruck, FaCheckCircle } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function CheckoutPaymentPage() {
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const { cartItems = [] } = useCart();

  useEffect(() => {
    const loc = localStorage.getItem("user_location");
    if (loc) setLocation(loc);
  }, []);

  // Нийт үнэ, хямдрал, хэмнэсэн мөнгө тооцоолох
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + ((item.discountPrice ?? item.price) * (item.quantity || 1)),
    0
  );
  const originalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * (item.quantity || 1)),
    0
  );
  const saved = originalPrice - totalPrice;
  const discountedCount = cartItems.filter(item => item.discountPrice && item.discountPrice < item.price).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Захиалга баталгаажлаа!");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
            <FaRegCreditCard className="inline mr-2 text-blue-600" />
            Төлбөрийн мэдээлэл
          </h1>
          <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
            {/* Байршлын мэдээлэл */}
            <div>
              <div className="flex items-center text-gray-700 font-semibold mb-2">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                Таны байршил:
              </div>
              <div className="bg-gray-100 border rounded-lg px-4 py-3 text-gray-700">
                {location || "Байршил оруулаагүй байна"}
              </div>
            </div>

            {/* Захиалах гэж буй барааны мэдээлэл */}
            <div>
              <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Захиалах бараанууд ({cartItems.length})
              </div>
              <ul className="divide-y divide-gray-100 mb-3">
                {cartItems.map((item, idx) => (
                  <li key={idx} className="py-2 flex items-center justify-between">
                    <span>
                      {item.name}
                      {item.size && <span className="text-xs text-gray-400 ml-2">({item.size})</span>}
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Хямдралтай</span>
                      )}
                    </span>
                    <span>
                      <span className={item.discountPrice && item.discountPrice < item.price ? "line-through text-gray-400 mr-2" : ""}>
                        {item.price?.toLocaleString()}₮
                      </span>
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="text-green-700 font-bold">{item.discountPrice?.toLocaleString()}₮</span>
                      )}
                      <span className="ml-2 text-gray-500">x{item.quantity}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-1 text-sm">
                <div>
                  Нийт үнэ: <span className="font-bold text-lg text-green-700">{totalPrice.toLocaleString()}₮</span>
                  {saved > 0 && (
                    <span className="ml-3 text-xs text-red-500">
                      (Хэмнэсэн: {saved.toLocaleString()}₮)
                    </span>
                  )}
                </div>
                {discountedCount > 0 && (
                  <div className="text-xs text-green-600">
                    {discountedCount} бараа хямдралтай үнээр байна.
                  </div>
                )}
              </div>
            </div>

            {/* Хаяг оруулах */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1 font-medium text-gray-800">
                  <FaTruck className="inline mr-1 text-green-600" />
                  Хүргэлтийн хаяг
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Жишээ: БЗД, 13-р хороо, 4-р байр"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition text-lg"
              >
                Захиалгаа баталгаажуулах
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

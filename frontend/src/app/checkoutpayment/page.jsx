"use client";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaRegCreditCard, FaTruck, FaCheckCircle } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function CheckoutPaymentPage() {
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const { cartItems = [] } = useCart();
  const { data: session } = useSession();
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const loc = localStorage.getItem("user_location");
    if (loc) setLocation(loc);
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetch("http://localhost:5000/api/coupon/user", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []));
  }, [session]);

  useEffect(() => {
    if (!coupons.length || !cartItems.length) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    // Купон бүрээр шалгаж, cart доторх item-уудын category-тай таарвал хэрэглэнэ
    let foundCoupon = null;
    let discount = 0;

    for (const coupon of coupons) {
      // Купоны category id-нуудыг бүгдийг string болгоно
      const couponCatIds = (coupon.categories || []).map(cat =>
        typeof cat === "object" && cat._id ? cat._id.toString() : cat.toString()
      );

      // Cart item-ийн category-г бас string болгоно
      const matchedItems = cartItems.filter(item =>
        couponCatIds.includes(
          typeof item.category === "object" && item.category._id
            ? item.category._id.toString()
            : item.category?.toString()
        )
      );

      if (matchedItems.length > 0) {
        foundCoupon = coupon;
        const matchedTotal = matchedItems.reduce(
          (sum, item) => sum + ((item.discountPrice ?? item.price) * (item.quantity || 1)),
          0
        );
        discount = Math.round(matchedTotal * (coupon.discount / 100));
        break;
      }
    }

    setAppliedCoupon(foundCoupon);
    setDiscountAmount(discount);
  }, [coupons, cartItems]);

  // Купон кодоор шалгах
  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponInput.trim()) {
      setCouponError("Купон код оруулна уу.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    const coupon = coupons.find(
      c => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );
    if (!coupon) {
      setCouponError("Ийм купон олдсонгүй.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    // Category id-г string болгож харьцуулна
    const couponCatIds = (coupon.categories || []).map(cat =>
      typeof cat === "object" && cat._id ? cat._id.toString() : cat.toString()
    );
    const matchedItems = cartItems.filter(item =>
      couponCatIds.includes(
        typeof item.category === "object" && item.category._id
          ? item.category._id.toString()
          : item.category?.toString()
      )
    );
    if (matchedItems.length === 0) {
      setCouponError("Энэ купон таны сагсанд байгаа бараанд тохирохгүй байна.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    const matchedTotal = matchedItems.reduce(
      (sum, item) => sum + ((item.discountPrice ?? item.price) * (item.quantity || 1)),
      0
    );
    const discount = Math.round(matchedTotal * (coupon.discount / 100));
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
    setCouponError("");
  };

  // Купон код өөрчлөгдөхөд автоматаар хямдрал арилгах
  useEffect(() => {
    if (!couponInput) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError("");
    }
  }, [couponInput]);

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
                  Нийт үнэ:{" "}
                  <span className="font-bold text-lg text-green-700">
                    {(totalPrice - discountAmount).toLocaleString()}₮
                  </span>
                  {discountAmount > 0 && appliedCoupon && (
                    <span className="ml-3 text-xs text-blue-600">
                      (Купон: {appliedCoupon.code} -{appliedCoupon.discount}% / Хэмнэлт: {discountAmount.toLocaleString()}₮)
                    </span>
                  )}
                  {saved > 0 && (
                    <span className="ml-3 text-xs text-red-500">
                      (Барааны хямдрал: {saved.toLocaleString()}₮)
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

            {/* Купон код оруулах хэсэг */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Купон код оруулах</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Купон код"
                  className="border px-3 py-2 rounded w-48"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Ашиглах
                </button>
              </div>
              {couponError && (
                <div className="text-red-600 text-xs mt-1">{couponError}</div>
              )}
              {appliedCoupon && discountAmount > 0 && (
                <div className="text-green-600 text-xs mt-1">
                  Купон: <b>{appliedCoupon.code}</b> (-{appliedCoupon.discount}%)
                  <br />
                  Хэмнэлт: <b>{discountAmount.toLocaleString()}₮</b>
                </div>
              )}
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

"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaRegCreditCard, FaTruck, FaCheckCircle, FaWallet } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function CheckoutPaymentPage() {
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const { cartItems = [] } = useCart();
  const { data: session } = useSession();
  const [wallet, setWallet] = useState(0);
  const [payWithWallet, setPayWithWallet] = useState(false);
  const [msg, setMsg] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const router = useRouter();
  const { clearCart } = useCart(); // CartContext дотор clearCart функц байгаа гэж үзэв

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

    let foundCoupon = null;
    let discount = 0;

    for (const coupon of coupons) {
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

  useEffect(() => {
    if (!couponInput) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError("");
    }
  }, [couponInput]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + ((item.discountPrice ?? item.price) * (item.quantity || 1)),
    0
  );
  const finalPrice = totalPrice - discountAmount;
  const originalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * (item.quantity || 1)),
    0
  );
  const saved = originalPrice - totalPrice;
  const discountedCount = cartItems.filter(item => item.discountPrice && item.discountPrice < item.price).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (payWithWallet) {
      if (wallet < finalPrice) {
        setMsg("Таны хэтэвчний үлдэгдэл хүрэлцэхгүй байна.");
        return;
      }
      try {
        await axios.post(
          "http://localhost:5000/api/orders",
          {
            cartItems: cartItems.map(item => ({
              product: item._id || item.product?._id, // эсвэл item.product
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            })),
            phone,
            note,
            location,
            totalPrice: finalPrice,
            payWithWallet,
            payWithQr: false,
            coupon: appliedCoupon
              ? {
                  code: appliedCoupon.code,
                  discount: appliedCoupon.discount,
                  discountAmount,
                }
              : null,
          },
          { headers: { Authorization: `Bearer ${session.accessToken}` } }
        );
        setMsg("Захиалга амжилттай, wallet-ээс төлөгдлөө!");
        clearCart(); // cart-ыг цэвэрлэнэ
        setTimeout(() => {
          router.push("/orders"); // /orders page руу шилжинэ
        }, 1000);
      } catch {
        setMsg("Захиалга хийхэд алдаа гарлаа.");
      }
    } else {
      setMsg("Бусад төлбөрийн арга хараахан идэвхгүй байна.");
    }
  };

  // Wallet үлдэгдэл авах useEffect нэмнэ
  useEffect(() => {
    if (!session?.accessToken) return;
    axios.get("http://localhost:5000/api/wallet/balance", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then(res => setWallet(res.data.wallet || 0))
      .catch(() => setWallet(0));
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          <FaRegCreditCard className="inline mr-2 text-blue-600" />
          Төлбөрийн мэдээлэл
        </h1>
        <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-8">
          {/* Wallet үлдэгдэл */}
          <div className="flex items-center gap-3 mb-4">
            <FaWallet className="text-green-600" />
            <span className="font-semibold">Таны хэтэвч:</span>
            <span className="text-2xl font-bold text-green-700">{wallet.toLocaleString()}₮</span>
          </div>
          {/* Төлбөрийн арга сонгох */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mb-2 block">Төлбөрийн арга:</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={payWithWallet}
                  onChange={() => setPayWithWallet(true)}
                />
                <span>Хэтэвчээр төлөх</span>
              </label>
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="radio"
                  checked={!payWithWallet}
                  onChange={() => setPayWithWallet(false)}
                  disabled
                />
                <span>Карт/Бэлэн (удахгүй)</span>
              </label>
            </div>
          </div>

          {/* Байршил */}
          <div>
            <div className="flex items-center text-gray-700 font-semibold mb-2">
              <span>Таны байршил</span>
              <button
                type="button"
                className="ml-3 text-blue-600 underline"
                onClick={() => setShowMap(true)}
              >
                Байршил солих
              </button>
            </div>
            <div className="bg-gray-100 border-l-4 border-blue-500 rounded px-4 py-3 text-gray-800 shadow-sm">
              {location || <span className="text-gray-400">Байршил оруулаагүй байна</span>}
            </div>
            {showMap && (
              <MapPicker
                onPick={({ address }) => setLocation(address)}
                onClose={() => setShowMap(false)}
              />
            )}
          </div>

          {/* Барааны жагсаалт */}
          <div>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Захиалах бараанууд ({cartItems.length})
            </div>
            <ul className="divide-y divide-gray-100 mb-3">
              {cartItems.map((item, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between text-sm sm:text-base">
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
            <div className="text-sm space-y-1">
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

          {/* Купон */}
          <div>
            <label className="block font-medium mb-1 text-gray-800">🎁 Купон код</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                placeholder="Купон код оруулна уу"
                className="border px-3 py-2 rounded w-full sm:w-64 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded hover:opacity-90 transition"
              >
                Ашиглах
              </button>
            </div>
            {couponError && (
              <div className="text-red-600 text-sm mt-2">{couponError}</div>
            )}
            {appliedCoupon && discountAmount > 0 && (
              <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                ✅ Купон <b>{appliedCoupon.code}</b> ашиглагдлаа!
                <span>Хэмнэлт: <b>{discountAmount.toLocaleString()}₮</b></span>
              </div>
            )}
          </div>

          {/* Хаяг оруулах */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Хүргэлтийн хаяг хэсгийг устгана */}

            <div>
              <label className="block mb-1 font-medium text-gray-800">
                📱 Утасны дугаар
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Жишээ: 99112233"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-800">
                📝 Тэмдэглэл
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Жишээ: Хаалганы код, нэмэлт заавар гэх мэт"
                rows={2}
                required // заавал болгож байна
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition text-lg shadow-lg"
            >
              ✅ Захиалгаа баталгаажуулах
            </button>
            {msg && <div className="text-center text-red-500 mt-2">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

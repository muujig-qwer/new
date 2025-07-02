"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function WalletPage() {
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [payType, setPayType] = useState("card"); // "card" эсвэл "qr"
  // Картын мэдээлэл
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  useEffect(() => {
    if (!session?.accessToken) return;
    const fetchWallet = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/wallet/balance", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        setWallet(res.data.wallet || 0);
      } catch {
        setMsg("Хэтэвчний үлдэгдэл авахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [session]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMsg("Зөв дүн оруулна уу.");
      return;
    }
    if (payType === "card") {
      // Картын мэдээлэл шалгах (test)
      if (!cardNumber || !cardName || !cardExp || !cardCvc) {
        setMsg("Картын бүх мэдээллийг бөглөнө үү.");
        return;
      }
      // Энд бодит картын интеграци байхгүй, зөвхөн тест
      setTimeout(async () => {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/wallet/add",
            { amount: Number(amount) },
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          );
          setWallet(res.data.wallet);
          setAmount("");
          setCardNumber("");
          setCardName("");
          setCardExp("");
          setCardCvc("");
          setMsg("Картаар амжилттай цэнэглэлээ! (Тест)");
        } catch {
          setMsg("Мөнгө нэмэхэд алдаа гарлаа.");
        }
      }, 1000);
    } else if (payType === "qr") {
      setMsg("QR-ээр цэнэглэх бол доорх QR кодыг уншуулна уу.");
      // QR төлбөрийн амжилтыг гараар баталгаажуулах эсвэл backend-ээс шалгах хэрэгтэй
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600 mb-4">Хэтэвчээ харахын тулд нэвтэрнэ үү.</p>
        <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Нэвтрэх
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 space-y-4 text-sm">
        <p className="text-gray-400">Нүүр хуудас · <span className="text-black font-medium">Миний хэтэвч</span></p>
        <nav className="flex flex-col gap-3 mt-4">
          <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>👤</span> Миний мэдээлэл
          </Link>
          <Link href="/wallet" className="flex items-center gap-2 text-blue-600 font-medium">
            <span>📁</span> Хэтэвч
          </Link>
          <Link href="/orders" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📦</span> Миний захиалгууд
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>💚</span> Хүслийн жагсаалт
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🔗</span> И-баримт холбох
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🔒</span> Нууц үг солих
          </Link>
          <Link href="/company/support/faq" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>❓</span> Тусламж
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🚪</span> Гарах
          </Link>
        </nav>
      </aside>

      {/* Wallet Section */}
      <section className="flex-1 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">💳</span> Миний хэтэвч
          </h1>
        </div>
        <div className="mb-6 text-center">
          <span className="text-gray-600">Үлдэгдэл:</span>
          <span className="text-3xl font-bold text-green-600 ml-2">{wallet.toLocaleString()}₮</span>
        </div>
        <form onSubmit={handleAddMoney} className="flex flex-col gap-4 max-w-xs mx-auto">
          <label className="font-medium text-gray-700">Мөнгө нэмэх</label>
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Дүн (₮)"
          />
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={payType === "card"}
                onChange={() => setPayType("card")}
              />
              <span>Картаар</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={payType === "qr"}
                onChange={() => setPayType("qr")}
              />
              <span>QR-ээр</span>
            </label>
          </div>
          {payType === "card" && (
            <div className="space-y-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Картын дугаар"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Карт эзэмшигчийн нэр"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="MM/YY"
                  value={cardExp}
                  onChange={e => setCardExp(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="CVC"
                  value={cardCvc}
                  onChange={e => setCardCvc(e.target.value)}
                  required
                />
              </div>
              <div className="text-xs text-gray-400">Энэ бол зөвхөн тест UI, бодит төлбөр хийгдэхгүй.</div>
            </div>
          )}
          {payType === "qr" && (
            <div className="flex flex-col items-center my-4">
              <p className="mb-2 text-gray-700 font-semibold">QR кодыг уншуулж цэнэглэнэ үү</p>
              <img
                src="/qr-demo.png"
                alt="QR төлбөр"
                className="w-48 h-48 object-contain border rounded-lg shadow"
              />
              <p className="mt-2 text-gray-500 text-sm">Төлбөр: <b>{amount ? Number(amount).toLocaleString() : 0}₮</b></p>
              <div className="text-xs text-gray-400 mt-2">QR-ээр цэнэглэлт гараар баталгаажих шаардлагатай.</div>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
          >
            Нэмэх
          </button>
          {msg && <p className="text-center text-red-500 text-sm mt-2">{msg}</p>}
        </form>
      </section>
    </div>
  );
}
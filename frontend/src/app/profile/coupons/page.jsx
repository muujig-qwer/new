'use client'
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function MyCouponsPage() {
  const { data: session, status } = useSession();
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Купон авах
  useEffect(() => {
    if (!session?.accessToken) return;
    fetch("http://localhost:5000/api/coupon/user", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCoupons(data.coupons || []);
        setLoading(false);
      });
  }, [session]);

  // Категори авах
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then((res) => {
      setCategories(res.data);
    });
  }, []);

  // ID-аас нэр авах функц
  const getCategoryName = (id) => {
    const cat = categories.find((c) => c._id === id);
    return cat ? cat.name : "Ерөнхий";
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
        <p className="text-lg text-gray-600 mb-4">Купон харахын тулд нэвтэрнэ үү.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 space-y-4 text-sm">
        <p className="text-gray-400">Нүүр хуудас · <span className="text-black font-medium">Миний купон</span></p>
        <nav className="flex flex-col gap-3 mt-4">
          <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>👤</span> Миний мэдээлэл
          </Link>
          <Link href="/wallet" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📁</span> Хэтэвч
          </Link>
          <Link href="/orders" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📦</span> Миний захиалгууд
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>💚</span> Хүслийн жагсаалт
          </Link>
          <Link href="/profile/coupons" className="flex items-center gap-2 text-green-600 font-medium">
            <span>🎟️</span> Миний купон
          </Link>
          <Link href="/company/support/faq" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>❓</span> Тусламж
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🚪</span> Гарах
          </Link>
        </nav>
      </aside>

      {/* Coupon List */}
      <section className="flex-1 bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Миний купонууд</h1>
        <div className="bg-white rounded shadow p-4">
          {coupons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Танд купон байхгүй байна.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="border border-blue-200 rounded-xl p-4 flex flex-col gap-2 bg-blue-50 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 text-lg">{c.code}</span>
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      {c.discount}% хөнгөлөлт
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {(c.categories && c.categories.length > 0)
                      ? c.categories.map((catId) => (
                          <span
                            key={catId}
                            className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded mb-1"
                          >
                            {getCategoryName(catId)}
                          </span>
                        ))
                      : (
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                            Бүх категори
                          </span>
                        )
                    }
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Дуусах огноо:{" "}
                    <span className="font-semibold">
                      {c.expires ? new Date(c.expires).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import clsx from "clsx";
import {
  BarChart3,
  Users,
  PackageCheck,
  PlusCircle,
  Tag,
  Layers,
  Settings,
  FileBarChart2,
} from "lucide-react";

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discount: "",
    expires: "",
    assignedTo: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const navItems = [
    { key: "dashboard", label: "Хянах самбар", icon: BarChart3, href: "/admin/dashboard" },
    { key: "products", label: "Бүтээгдэхүүн", icon: PlusCircle, href: "/admin/products" },
    { key: "orders", label: "Захиалгууд", icon: PackageCheck, href: "/admin/orders" },
    { key: "users", label: "Хэрэглэгчид", icon: Users, href: "/admin/users" },
    { key: "categories", label: "Ангилал", icon: Tag, href: "/admin/categories" },
    { key: "coupons", label: "Купон", icon: Layers, href: "/admin/coupons" },
    { key: "settings", label: "Тохиргоо", icon: Settings, href: "/admin/settings" },
    { key: "reports", label: "Тайлан", icon: FileBarChart2, href: "/admin/reports" },
  ];

  // Админ биш бол redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email !== "muujig165@gmail.com") {
      router.replace("/");
    }
  }, [session, status, router]);

  // Купонуудыг авах
  const fetchCoupons = async () => {
    if (!session?.accessToken) return;
    const res = await fetch("http://localhost:5000/api/coupon/list", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [session]);

  // Категориудыг авах
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then((res) => {
      setCategories(res.data);
    });
  }, []);

  // Формын утга өөрчлөх
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Купон үүсгэх
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const token = session?.accessToken;

    axios.post(
      "http://localhost:5000/api/coupon/create",
      {
        code: form.code,
        discount: Number(form.discount),
        expires: form.expires,
        assignedTo: form.assignedTo
          ? form.assignedTo.split(",").map((email) => email.trim())
          : [],
        categories: selectedCategories,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      const data = response.data;
      if (response.status === 200) {
        setMessage("Купон амжилттай үүслээ!");
        setForm({ code: "", discount: "", expires: "", assignedTo: "" });
        fetchCoupons();
      } else {
        setMessage(data.message || "Алдаа гарлаа");
      }
    }).catch(() => {
      setMessage("Алдаа гарлаа");
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="text-xl font-bold text-green-700 p-6">🛍 Admin Panel</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ key, label, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded hover:bg-green-100 text-sm",
                key === "coupons"
                  ? "bg-green-200 text-green-900 font-medium"
                  : "text-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <div className="max-w-2xl mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6">Купон үүсгэх</h1>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <div>
              <label className="block mb-1 font-medium">Купон код</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Хөнгөлөлтийн хувь (%)</label>
              <input
                name="discount"
                type="number"
                value={form.discount}
                onChange={handleChange}
                required
                min={1}
                max={100}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Дуусах огноо</label>
              <input
                name="expires"
                type="date"
                value={form.expires}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Зөвшөөрөгдсөн хэрэглэгчид (email, , -ээр тусгаарлана)</label>
              <input
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                placeholder="user1@gmail.com, user2@gmail.com"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Категори сонгох</label>
              <select
                multiple
                value={selectedCategories}
                onChange={e =>
                  setSelectedCategories(
                    Array.from(e.target.selectedOptions, option => option.value)
                  )
                }
                className="w-full border px-3 py-2 rounded"
              >
                {categories
                  .filter(cat => !cat.parent)
                  .map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">Ctrl (Cmd) дарж олон категори сонгоно уу</div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Үүсгэж байна..." : "Купон үүсгэх"}
            </button>
            {message && (
              <div
                className={`mt-2 text-center text-sm ${
                  message.includes("амжилттай") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </form>

          <h2 className="text-xl font-bold mt-10 mb-4">Купонуудын жагсаалт</h2>
          <div className="bg-white rounded shadow p-4">
            {coupons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Купон бүртгэгдээгүй байна.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Код</th>
                      <th className="text-left py-2">Хөнгөлөлт</th>
                      <th className="text-left py-2">Дуусах огноо</th>
                      <th className="text-left py-2">Зөвшөөрөгдсөн</th>
                      <th className="text-left py-2">Категориуд</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id} className="border-t">
                        <td className="py-1">{c.code}</td>
                        <td className="py-1">{c.discount}%</td>
                        <td className="py-1">
                          {c.expires ? new Date(c.expires).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-1">
                          {c.assignedTo?.length
                            ? c.assignedTo.join(", ")
                            : "Бүх хэрэглэгч"}
                        </td>
                        <td className="py-1">
                          {c.categories?.length
                            ? c.categories.map(cat => cat.name || cat).join(", ")
                            : "Бүх категори"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
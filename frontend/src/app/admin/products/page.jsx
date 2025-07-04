"use client";
import { useEffect, useState } from "react";
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState("products");

  const navItems = [
    { key: "dashboard", label: "Хянах самбар", icon: BarChart3, href: "/admin/dashboard" },
    { key: "products", label: "Бүтээгдэхүүн", icon: PlusCircle, href: "/admin/products" },
    { key: "orders", label: "Захиалгууд", icon: PackageCheck, href: "/admin/orders" },
    { key: "users", label: "Хэрэглэгчид", icon: Users, href: "/users" },
    { key: "categories", label: "Ангилал", icon: Tag, href: "/admin/categories" },
    { key: "coupons", label: "Купон", icon: Layers, href: "/admin/coupons" },
    { key: "settings", label: "Тохиргоо", icon: Settings, href: "/admin/settings" },
    { key: "reports", label: "Тайлан", icon: FileBarChart2, href: "/admin/reports" },
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Устгахад алдаа гарлаа");
    }
  };

  const getCategoryName = (cat) => {
    if (!cat) return "-";
    if (typeof cat === "object" && cat.name) return cat.name;
    const found = categories.find((c) => c._id === cat || c._id === cat?._id);
    return found ? found.name : "-";
  };

  function isDiscountActive(product) {
    // discountEnd, discountExpires аль алиныг нь шалгахад тохиромжтой
    if (!product?.discountEnd && !product?.discountExpires) return product.discount > 0;
    const end = product.discountEnd || product.discountExpires;
    return product.discount > 0 && new Date(end) > new Date();
  }

  if (status === "loading") return <div>Ачааллаж байна...</div>;

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
                key === "products"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Бүтээгдэхүүний жагсаалт</h1>
          <Link
            href="/admin/products/add"
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            + Шинэ бүтээгдэхүүн
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Нэр</th>
                <th className="p-2 border">Ангилал</th>
                <th className="p-2 border">Үнэ</th>
                <th className="p-2 border">Хямдрал</th>
                <th className="p-2 border">Үлдэгдэл</th>
                <th className="p-2 border">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p._id} className="text-center">
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{getCategoryName(p.category)}</td>
                  <td className="p-2 border">{p.price?.toLocaleString()}₮</td>
                  <td className="p-2 border">
                    {isDiscountActive(p) ? (
                      <span className="text-red-600 font-bold">-{p.discount}%</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 border">
                    {Array.isArray(p.stock)
                      ? p.stock.reduce((sum, s) => sum + (s.quantity || 0), 0)
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    <Link
                      href={`/products/edit/${p._id}`}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Засах
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Устгах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
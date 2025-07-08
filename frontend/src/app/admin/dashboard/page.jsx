"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Users,
  PackageCheck,
  PlusCircle,
  Tag,
  Layers,
  Settings,
  FileBarChart2,
  TrendingUp,
  UserPlus,
  Menu,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [monthlyStats, setMonthlyStats] = useState(null);

  const navItems = [
    { href: "/admin/dashboard", label: "Хянах самбар", icon: BarChart3 },
    { href: "/admin/products", label: "Бүтээгдэхүүн", icon: PlusCircle },
    { href: "/admin/orders", label: "Захиалгууд", icon: PackageCheck },
    { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
    { href: "/admin/categories", label: "Ангилал", icon: Tag },
    { href: "/admin/coupons", label: "Купон", icon: Layers },
    { href: "/admin/reports", label: "Тайлан", icon: FileBarChart2 },
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
    if (session?.user?.role !== "admin") router.replace("/");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.accessToken && session.user?.role === "admin") {
      const fetchStats = async () => {
        try {
          const [productsRes, usersRes, ordersRes] = await Promise.all([
            axios.get("http://localhost:5000/api/products"),
            axios.get("http://localhost:5000/api/auth/users", {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
            axios.get("http://localhost:5000/api/orders", {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
          ]);
          setStats({
            products: Array.isArray(productsRes.data.products) ? productsRes.data.products.length : 0,
            users: usersRes.data.length,
            orders: ordersRes.data.length,
          });
        } catch (e) {
          console.error("Stat fetch error", e);
        }
      };
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/monthly-stats")
      .then((res) => setMonthlyStats(res.data))
      .catch(() => setMonthlyStats(null));
  }, []);

  if (status === "loading") return <div>Ачааллаж байна...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar toggle button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      {/* Sidebar: mobile (fixed), desktop (static) */}
      {/* Mobile sidebar (toggle) */}
      <aside
        className={clsx(
          "fixed top-0 left-0 w-64 bg-white shadow-lg min-h-screen transform transition-transform duration-300 z-40 md:hidden",
          {
            "-translate-x-full": !isSidebarOpen,
            "translate-x-0": isSidebarOpen,
          }
        )}
      >
        <div className="text-xl font-bold text-green-700 p-6">🛍 Admin Panel</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded hover:bg-green-100 text-sm",
                href === "/admin/dashboard"
                  ? "bg-green-200 text-green-900 font-medium"
                  : "text-gray-700"
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Desktop sidebar (always visible, static) */}
      <aside className="hidden md:block w-64 bg-white shadow-lg min-h-screen">
        <div className="text-xl font-bold text-green-700 p-6">🛍 Admin Panel</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded hover:bg-green-100 text-sm",
                href === "/admin/dashboard"
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
      <main className="flex-1 p-4 md:p-10 md:ml-64">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-10">
          🛠️ Хянах Самбар
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10">
          <div className="bg-blue-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <BarChart3 className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{stats.products}</p>
            <p className="mt-1 text-sm md:text-lg">Бүтээгдэхүүн</p>
          </div>
          <div className="bg-green-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <Users className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{stats.users}</p>
            <p className="mt-1 text-sm md:text-lg">Хэрэглэгчид</p>
          </div>
          <div className="bg-yellow-500 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <PackageCheck className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{stats.orders}</p>
            <p className="mt-1 text-sm md:text-lg">Захиалгууд</p>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
          <div className="bg-purple-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <TrendingUp className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{monthlyStats?.soldProducts ?? "-"}</p>
            <p className="mt-1 text-sm md:text-lg">Энэ сард зарсан бараа</p>
          </div>
          <div className="bg-pink-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <PlusCircle className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{monthlyStats?.newProducts ?? "-"}</p>
            <p className="mt-1 text-sm md:text-lg">Энэ сард нэмэгдсэн бараа</p>
          </div>
          <div className="bg-indigo-600 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <UserPlus className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{monthlyStats?.newUsers ?? "-"}</p>
            <p className="mt-1 text-sm md:text-lg">Энэ сард нэмэгдсэн хэрэглэгч</p>
          </div>
          <div className="bg-green-700 text-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center">
            <BarChart3 className="h-8 w-8 md:h-10 md:w-10 mb-2" />
            <p className="text-2xl md:text-3xl font-bold">{monthlyStats?.totalRevenue?.toLocaleString() ?? "-"}</p>
            <p className="mt-1 text-sm md:text-lg">Энэ сард орсон орлого</p>
          </div>
        </div>
      </main>
    </div>
  );
}

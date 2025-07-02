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
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });

  const navItems = [
    { href: "/admin", label: "Хянах самбар", icon: BarChart3 },
    { href: "/admin/products", label: "Бүтээгдэхүүн", icon: PlusCircle },
    { href: "/admin/orders", label: "Захиалгууд", icon: PackageCheck },
    { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
    { href: "/admin/categories", label: "Ангилал", icon: Tag },
    { href: "/admin/coupons", label: "Купон", icon: Layers },
    { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
    { href: "/admin/reports", label: "Тайлан", icon: FileBarChart2 },
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
            products: productsRes.data.length,
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

  if (status === "loading") return <div>Ачааллаж байна...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="text-xl font-bold text-green-700 p-6">🛍 Admin Panel</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded hover:bg-green-100 text-sm",
                href === "/admin" ? "bg-green-200 text-green-900 font-medium" : "text-gray-700"
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
        <h1 className="text-4xl font-bold text-gray-800 mb-10">🛠️ Хянах Самбар</h1>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <BarChart3 className="h-10 w-10 mb-3" />
            <p className="text-3xl font-bold">{stats.products}</p>
            <p className="mt-2 text-lg">Бүтээгдэхүүн</p>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <Users className="h-10 w-10 mb-3" />
            <p className="text-3xl font-bold">{stats.users}</p>
            <p className="mt-2 text-lg">Хэрэглэгчид</p>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <PackageCheck className="h-10 w-10 mb-3" />
            <p className="text-3xl font-bold">{stats.orders}</p>
            <p className="mt-2 text-lg">Захиалгууд</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {navItems.slice(1).map(({ href, label, icon: Icon }) => (
            <div
              key={href}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex flex-col items-center"
            >
              <Icon className="h-8 w-8 mb-2 text-green-600" />
              <h2 className="font-semibold text-lg mb-2">{label}</h2>
              <Link
                href={href}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {label} руу
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

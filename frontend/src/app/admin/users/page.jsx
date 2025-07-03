"use client";
import { useEffect, useState } from "react";
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
import axios from "axios";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!session?.accessToken) return;
    axios
      .get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [session]);

  const handleDelete = async (id) => {
    if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Устгахад алдаа гарлаа");
    }
  };

  if (loading) return <div>Уншиж байна...</div>;

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
                key === "users"
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
        <h1 className="text-2xl font-bold mb-4">Хэрэглэгчид</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-black text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-2">#</th>
                <th className="border px-2 py-2">Нэр</th>
                <th className="border px-2 py-2">Имэйл</th>
                <th className="border px-2 py-2">Үүрэг</th>
                <th className="border px-2 py-2">Бүртгүүлсэн</th>
                <th className="border px-2 py-2">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id}>
                  <td className="border px-2 py-2">{idx + 1}</td>
                  <td className="border px-2 py-2">{user.name}</td>
                  <td className="border px-2 py-2">{user.email}</td>
                  <td className="border px-2 py-2">
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        try {
                          await axios.put(
                            `http://localhost:5000/api/auth/users/${user._id}/role`,
                            { role: newRole },
                            { headers: { Authorization: `Bearer ${session?.accessToken}` } }
                          );
                          setUsers((prev) =>
                            prev.map((u) =>
                              u._id === user._id ? { ...u, role: newRole } : u
                            )
                          );
                        } catch {
                          alert("Үүрэг солих үед алдаа гарлаа");
                        }
                      }}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="delivery">staff</option>
                    </select>
                  </td>
                  <td className="border px-2 py-2">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="border px-2 py-2">
                    <button
                      onClick={() => handleDelete(user._id)}
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
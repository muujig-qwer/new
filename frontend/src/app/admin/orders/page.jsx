'use client'
import { useSession } from "next-auth/react";
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
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [assigning, setAssigning] = useState({});
  const router = useRouter();

  const navItems = [
    { key: "dashboard", label: "Хянах самбар", icon: BarChart3, href: "/admin/dashboard" },
    { key: "products", label: "Бүтээгдэхүүн", icon: PlusCircle, href: "/admin/products" },
    { key: "orders", label: "Захиалгууд", icon: PackageCheck, href: "/admin/orders" },
    { key: "users", label: "Хэрэглэгчид", icon: Users, href: "/admin/users" },
    { key: "categories", label: "Ангилал", icon: Tag, href: "/admin/categories" },
    { key: "coupons", label: "Купон", icon: Layers, href: "/admin/coupons" },
    { key: "reports", label: "Тайлан", icon: FileBarChart2, href: "/admin/reports" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.accessToken) return;
      const res = await fetch('http://localhost:5000/api/orders/admin/orders', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await res.json();
      setOrders(data.orders || data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [session]);

  useEffect(() => {
    // Хүргэлтийн ажилтнуудыг авах
    if (!session?.accessToken) return;
    fetch("http://localhost:5000/api/delivery", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setStaffList(data));
  }, [session]);

  const handleAssign = async (orderId) => {
    if (!selectedStaff[orderId]) return;
    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    await fetch(`http://localhost:5000/api/admin/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ delivery: selectedStaff[orderId] }),
    });
    // Захиалгуудыг дахин ачаалах
    const res = await fetch('http://localhost:5000/api/orders/admin/orders', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const data = await res.json();
    setOrders(data.orders || data || []);
    setAssigning((prev) => ({ ...prev, [orderId]: false }));
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
                key === "orders"
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
        <h1 className="text-2xl font-bold mb-4">Бүх захиалгууд</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-black text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-2">Захиалга #</th>
                <th className="border px-2 py-2">Хэрэглэгч</th>
                <th className="border px-2 py-2">Имэйл</th>
                <th className="border px-2 py-2">Огноо</th>
                <th className="border px-2 py-2">Утас</th>
                <th className="border px-2 py-2">Байршил</th>
                <th className="border px-2 py-2">Тэмдэглэл</th>
                <th className="border px-2 py-2">Бараанууд</th>
                <th className="border px-2 py-2">Купон</th>
                <th className="border px-2 py-2">Төлбөрийн арга</th>
                <th className="border px-2 py-2">Нийт дүн</th>
                <th className="border px-2 py-2">Статус</th>
                <th className="border px-2 py-2">Оноох</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(orders) ? orders : []).map((order) => (
                <tr key={order._id}>
                  <td className="border px-2 py-2">{order._id}</td>
                  <td className="border px-2 py-2">{order.user?.name}</td>
                  <td className="border px-2 py-2">{order.user?.email}</td>
                  <td className="border px-2 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-2">{order.phone}</td>
                  <td className="border px-2 py-2">{order.location}</td>
                  <td className="border px-2 py-2">{order.note}</td>
                  <td className="border px-2 py-2">
                    <ul className="list-disc ml-4">
                      {order.cartItems?.map((item, idx) => (
                        <li key={idx}>
                          {item.product?.name || item.product} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border px-2 py-2">
                    {order.coupon?.code
                      ? `${order.coupon.code} (${order.coupon.discount}% / -${order.coupon.discountAmount}₮)`
                      : "-"}
                  </td>
                  <td className="border px-2 py-2">
                    {order.payWithWallet ? "Хэтэвч" : order.payWithQr ? "QR" : "Бусад"}
                  </td>
                  <td className="border px-2 py-2">{order.totalPrice?.toLocaleString()}₮</td>
                  <td className="border px-2 py-2">{order.status}</td>
                  <td className="border px-2 py-2">
                    {(order.status === "pending" || order.status === "assigned") ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedStaff[order._id] || ""}
                          onChange={e =>
                            setSelectedStaff(prev => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Ажилтан сонгох</option>
                          {staffList.map(staff => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(order._id)}
                          disabled={!selectedStaff[order._id] || assigning[order._id]}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Оноох
                        </button>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
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
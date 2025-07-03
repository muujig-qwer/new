"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaClipboardList, FaUserCircle } from "react-icons/fa";
import axios from "axios";

export default function StaffDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    // Хэрвээ staff биш бол эхлэл рүү буцаана
    if (!session?.user || session.user.role !== "delivery") {
      router.replace("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      setLoadingOrders(true);
      axios
        .get("http://localhost:5000/api/delivery/orders", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [session]);

  const updateStatus = async (orderId, status) => {
    await axios.patch(
      `http://localhost:5000/api/delivery/orders/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    // orders-оо дахин ачаалгах
    setLoadingOrders(true);
    const res = await axios.get("http://localhost:5000/api/delivery/orders", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    setOrders(res.data);
    setLoadingOrders(false);
  };

  if (status === "loading") return <div>Уншиж байна...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="text-xl font-bold text-green-700 p-6 flex items-center gap-2">
          <FaUserCircle className="text-green-700" />
          Staff Panel
        </div>
        <nav className="space-y-1 px-3">
          <Link
            href="/staff/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded bg-green-200 text-green-900 font-medium text-sm"
          >
            <FaClipboardList className="h-5 w-5" />
            Захиалгууд
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-4">Хүргэлтийн захиалгууд</h1>
        {loadingOrders ? (
          <div>Захиалгуудыг ачааллаж байна...</div>
        ) : orders.length === 0 ? (
          <div>Одоогоор захиалга алга.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-black text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-2">#</th>
                  <th className="border px-2 py-2">Захиалагч</th>
                  <th className="border px-2 py-2">Утас</th>
                  <th className="border px-2 py-2">Хаяг</th>
                  <th className="border px-2 py-2">Тэмдэглэл</th>
                  <th className="border px-2 py-2">Огноо</th>
                  <th className="border px-2 py-2">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order._id}>
                    <td className="border px-2 py-2">{idx + 1}</td>
                    <td className="border px-2 py-2">{order.user?.name || "-"}</td>
                    <td className="border px-2 py-2">{order.phone || "-"}</td>
                    <td className="border px-2 py-2">{order.location || "-"}</td>
                    <td className="border px-2 py-2">{order.note || "-"}</td>
                    <td className="border px-2 py-2">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border px-2 py-2">
                      {order.status === "assigned" && (
                        <button
                          onClick={() => updateStatus(order._id, "out_for_delivery")}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Захиалгыг хүлээж авах
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button
                          onClick={() => updateStatus(order._id, "completed")}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Хүлээлгэж өгсөн
                        </button>
                      )}
                      {order.status === "completed" && (
                        <span className="text-green-700 font-semibold">Дууссан</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {/* Bottom left floating button */}
      <button
        className="fixed left-8 bottom-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
        onClick={() => alert("Үйлдэл!")} // Энд өөр үйлдэл хийх боломжтой
      >
        <FaClipboardList className="h-5 w-5" />
        Шинэ захиалга
      </button>
    </div>
  );
}
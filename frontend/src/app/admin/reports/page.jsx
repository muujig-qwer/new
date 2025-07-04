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

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [searchReport, setSearchReport] = useState("");
  const [filter, setFilter] = useState({ groupBy: "day" });

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
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.replace("/login");
      return;
    }
    axios
      .get("http://localhost:5000/api/admin/reports")
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  const handleViewReport = async (report, customFilter = filter) => {
  console.log("Send filter:", customFilter);  // Шалгах зорилгоор
  setSelectedReport(report);
  setReportLoading(true);
  setReportData(null);
  try {
    const params = new URLSearchParams(customFilter).toString();
    const res = await axios.get(`http://localhost:5000/api/admin/reports/${report._id}?${params}`);
    setReportData(res.data);
  } catch {
    setReportData({ error: "Тайлан авахад алдаа гарлаа" });
  }
  setReportLoading(false);
};


  if (loading) return <div>Уншиж байна...</div>;

  function ReportPreview({ report, data, onFilter, filter }) {
    if (!data) return null;

    if (report._id === "orders") {
      return (
        <div>
          <div className="mb-4 flex gap-2 items-center">
            <span className="font-semibold">Бүлэглэх:</span>
            <select
              value={filter.groupBy}
              onChange={e => {
                const updatedFilter = { ...filter, groupBy: e.target.value };
                // Хэрвээ өдөр сонговол өнөөдрийн огноог filter-д нэмнэ
                if (e.target.value === "day") {
                  const today = new Date().toISOString().slice(0, 10); // "2025-07-04"
                  updatedFilter.date = today;
                } else {
                  delete updatedFilter.date;
                }
                setFilter(updatedFilter);
                handleViewReport(report, updatedFilter);
              }}
              className="border p-1 rounded"
            >
              <option value="day">Өдөр</option>
              <option value="month">Сар</option>
              <option value="year">Жил</option>
            </select>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Нийт захиалга:</span> {data.stats?.[0]?.totalOrders || "-"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Нийт орлого:</span> {data.stats?.reduce((a, b) => a + (b.totalRevenue || 0), 0)?.toLocaleString() || "-"}₮
          </div>
          <div className="mb-2">
            <span className="font-semibold">Дундаж захиалгын үнэ:</span> {data.stats?.length ? Math.round(data.stats.reduce((a, b) => a + (b.avgOrderValue || 0), 0) / data.stats.length).toLocaleString() : "-"}₮
          </div>
          <div className="mb-2">
            <span className="font-semibold">Төлбөрийн төрөл:</span>
            <ul className="list-disc ml-6">
              <li>Wallet: {data.paymentSummary?.wallet || 0}</li>
              <li>QR: {data.paymentSummary?.qr || 0}</li>
              <li>Бэлэн: {data.paymentSummary?.cash || 0}</li>
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Хүргэлтийн төлөв:</span>
            <ul className="list-disc ml-6">
              {data.deliverySummary &&
                Object.entries(data.deliverySummary).map(([k, v]) => (
                  <li key={k}>{k}: {v}</li>
                ))}
            </ul>
          </div>
        </div>
      );
    }

    // ... Та өөрийн бусад тайлангийн хэсгүүдийг мөн адил энд нэмнэ ...

    return (
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

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
                key === "reports"
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Тайлан</h1>

          <div className="mb-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Тайлангийн нэрээр хайх..."
              className="border p-2 rounded flex-1"
              value={searchReport}
              onChange={e => setSearchReport(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Тайлангийн нэр</th>
                  <th className="p-2 border">Огноо</th>
                  <th className="p-2 border">Төлөв</th>
                  <th className="p-2 border">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">Тайлан олдсонгүй</td>
                  </tr>
                ) : (
                  reports
                    .filter(r =>
                      r.title.toLowerCase().includes(searchReport.toLowerCase())
                    )
                    .map((report, idx) => (
                      <tr key={report._id || idx}>
                        <td className="p-2 border">{idx + 1}</td>
                        <td className="p-2 border">{report.title}</td>
                        <td className="p-2 border">{report.date}</td>
                        <td className="p-2 border">{report.status}</td>
                        <td className="p-2 border flex gap-2">
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                            onClick={() => handleViewReport(report)}
                          >
                            Дэлгэрэнгүй
                          </button>
                          <a
                            href={`/api/admin/reports/${report._id}/csv`}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                            download
                          >
                            CSV татах
                          </a>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {selectedReport && (
            <div className="mt-8 p-4 border rounded bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{selectedReport.title} - дэлгэрэнгүй</h2>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => { setSelectedReport(null); setReportData(null); }}
                >
                  Хаах
                </button>
              </div>
              <div className="mb-4 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Нэр, утгаар хайх..."
                  className="border p-2 rounded flex-1"
                  onChange={e => {
                    const f = { ...filter, search: e.target.value };
                    setFilter(f);
                    handleViewReport(selectedReport, f);
                  }}
                />
              </div>
              {reportLoading ? (
                <div>Уншиж байна...</div>
              ) : reportData?.error ? (
                <div className="text-red-600">{reportData.error}</div>
              ) : (
                <ReportPreview
                  report={selectedReport}
                  data={reportData}
                  filter={filter}
                  onFilter={f => {
                    setFilter(f);
                    handleViewReport(selectedReport, f);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

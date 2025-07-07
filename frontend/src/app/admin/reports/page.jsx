"use client";
import React from "react";
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

    // Захиалгын тайлан
    if (report._id === "orders") {
      return (
        <div>
          <div className="mb-4 flex gap-2 items-center">
            <span className="font-semibold">Бүлэглэх:</span>
            <select
              value={filter.groupBy}
              onChange={e => {
                const updatedFilter = { ...filter, groupBy: e.target.value };
                setFilter(updatedFilter);
                handleViewReport(report, updatedFilter);
              }}
              className="border p-1 rounded"
            >
              <option value="day">Өдөр</option>
              <option value="month">Сар</option>
              <option value="year">Жил</option>
            </select>
            <input
              type="date"
              value={filter.from || ""}
              onChange={e => {
                const updatedFilter = { ...filter, from: e.target.value };
                setFilter(updatedFilter);
                handleViewReport(report, updatedFilter);
              }}
              className="border p-1 rounded"
              placeholder="Эхлэх огноо"
            />
            <input
              type="date"
              value={filter.to || ""}
              onChange={e => {
                const updatedFilter = { ...filter, to: e.target.value };
                setFilter(updatedFilter);
                handleViewReport(report, updatedFilter);
              }}
              className="border p-1 rounded"
              placeholder="Дуусах огноо"
            />
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
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">Огноо</th>
                <th className="p-2 border">Захиалга</th>
                <th className="p-2 border">Орлого</th>
                <th className="p-2 border">Дундаж үнэ</th>
              </tr>
            </thead>
            <tbody>
              {data.stats?.map((row, i) => (
                <tr key={row.date || row._id || i}>
                  <td className="p-2 border">{row.date || row._id}</td>
                  <td className="p-2 border">{row.totalOrders}</td>
                  <td className="p-2 border">{row.totalRevenue?.toLocaleString()}₮</td>
                  <td className="p-2 border">{row.avgOrderValue?.toLocaleString()}₮</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Барааны борлуулалтын тайлан
    if (report._id === "products") {
      return (
        <div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Бүтээгдэхүүн</th>
                <th className="p-2 border">Үлдэгдэл</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map((p, i) => (
                <tr key={p._id}>
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">
                    {Array.isArray(p.stock) && p.stock.length > 0
                      ? p.stock.map(s => (
                          <span key={s._id} className="inline-block mr-2">
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                background: s.color,
                                borderRadius: "50%",
                                marginRight: 4,
                                border: "1px solid #ccc",
                                verticalAlign: "middle"
                              }}
                              title={s.color}
                            ></span>
                            {s.quantity}
                          </span>
                        ))
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Хэрэглэгчийн тайлан
    if (report._id === "users") {
      return (
        <div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Нэр</th>
                <th className="p-2 border">И-мэйл</th>
                <th className="p-2 border">Төрөл</th>
              </tr>
            </thead>
            <tbody>
              {data.users?.map((u, i) => (
                <tr key={u._id}>
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Купон ашиглалтын тайлан
    if (report._id === "coupons") {
      return (
        <div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">Купон код</th>
                <th className="p-2 border">Ашигласан тоо</th>
                <th className="p-2 border">Нийт хэмнэлт</th>
              </tr>
            </thead>
            <tbody>
              {data.topCoupons?.map((c, i) => (
                <tr key={c._id || i}>
                  <td className="p-2 border">{c._id}</td>
                  <td className="p-2 border">{c.used}</td>
                  <td className="p-2 border">{c.totalSaved?.toLocaleString()}₮</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>Нийт ашигласан купон: {data.totalUsed}</div>
          <div>Нийт хэмнэсэн дүн: {data.totalSaved?.toLocaleString()}₮</div>
        </div>
      );
    }

    // Орлогын тайлан
    if (report._id === "revenue") {
      return (
        <div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">Огноо</th>
                <th className="p-2 border">Орлого</th>
              </tr>
            </thead>
            <tbody>
              {data.daily?.map((row, i) => (
                <tr key={row._id || i}>
                  <td className="p-2 border">{row._id}</td>
                  <td className="p-2 border">{row.revenue?.toLocaleString()}₮</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Хүргэлтийн тайлан
    if (report._id === "delivery") {
      return (
        <div>
          <div className="mb-2 font-semibold">Хүргэлтийн төлөв:</div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">Төлөв</th>
                <th className="p-2 border">Тоо</th>
              </tr>
            </thead>
            <tbody>
              {data.status?.map((s, i) => (
                <tr key={s._id || i}>
                  <td className="p-2 border">{s._id}</td>
                  <td className="p-2 border">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-2 font-semibold">Хүргэлтийн компаниуд:</div>
          <table className="min-w-full bg-white border rounded text-sm">
            <thead>
              <tr>
                <th className="p-2 border">Компани/Ажилтан ID</th>
                <th className="p-2 border">Хүргэлтийн тоо</th>
              </tr>
            </thead>
            <tbody>
              {data.companies?.map((c, i) => (
                <tr key={c._id || i}>
                  <td className="p-2 border">
                    {c.name ? c.name : c._id}
                  </td>
                  <td className="p-2 border">{c.delivered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Нөөц багатай бүтээгдэхүүн
    if (report._id === "lowstock") {
      return (
        <div>
          <div className="mb-2 font-semibold">Нөөц багатай бүтээгдэхүүнүүд:</div>
          <table className="min-w-full bg-white border rounded text-sm mb-2">
            <thead>
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Бүтээгдэхүүний нэр</th>
                <th className="p-2 border">Үлдэгдэл (өнгө тус бүр)</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map((p, i) => (
                <tr key={p._id}>
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">
                    {p.stock
                      .filter(s => s.quantity <= (filter.threshold || 5))
                      .map(s => (
                        <span key={s._id} className="inline-block mr-2">
                          <span
                            style={{
                              display: "inline-block",
                              width: 12,
                              height: 12,
                              background: s.color,
                              borderRadius: "50%",
                              marginRight: 4,
                              border: "1px solid #ccc",
                              verticalAlign: "middle"
                            }}
                            title={s.color}
                          ></span>
                          {s.quantity}
                        </span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>Нийт: {data.count} бүтээгдэхүүн</div>
        </div>
      );
    }

    // Бусад тайланд JSON fallback
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
                    .filter(r => r.title.toLowerCase().includes(searchReport.toLowerCase()))
                    .map((report, idx) => (
                      <React.Fragment key={report._id || idx}>
                        <tr>
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
                              href={`http://localhost:5000/api/admin/reports/${report._id}/pdf`}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              PDF татах
                            </a>
                          </td>
                        </tr>
                        {/* Зөвхөн сонгогдсон тайлан дэлгэрэнгүйг харуулна */}
                        {selectedReport && selectedReport._id === report._id && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="p-4 border-t bg-white">
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
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

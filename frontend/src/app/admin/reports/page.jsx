"use client";
import React from "react";
import { useEffect, useState, useMemo } from "react";
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
  DollarSign, // Icons for summary
  Clock, // Icons for summary
  UserPlus, // Icons for summary
  Archive,
  Menu, // Icons for summary
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Нэгдсэн мэдээллийн карт компонент
const SummaryCard = ({ title, value, icon: Icon, unit = "" }) => (
  <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
    <div className="bg-green-100 p-3 rounded-full">
      <Icon className="h-6 w-6 text-green-700" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {value?.toLocaleString()}
        {unit}
      </p>
    </div>
  </div>
);

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [issidebarOpen, setisSidebarOpen] = useState(false);

  // Нэгдсэн мэдээлэлд зориулсан state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const navItems = [
    {
      key: "dashboard",
      label: "Хянах самбар",
      icon: BarChart3,
      href: "/admin/dashboard",
    },
    {
      key: "products",
      label: "Бүтээгдэхүүн",
      icon: PlusCircle,
      href: "/admin/products",
    },
    {
      key: "orders",
      label: "Захиалгууд",
      icon: PackageCheck,
      href: "/admin/orders",
    },
    { key: "users", label: "Хэрэглэгчид", icon: Users, href: "/admin/users" },
    {
      key: "categories",
      label: "Ангилал",
      icon: Tag,
      href: "/admin/categories",
    },
    { key: "coupons", label: "Купон", icon: Layers, href: "/admin/coupons" },
    {
      key: "reports",
      label: "Тайлан",
      icon: FileBarChart2,
      href: "/admin/reports",
    },
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.replace("/login");
      return;
    }

    // Нэгдсэн мэдээлэл болон тайлангийн жагсаалтыг зэрэг татах
    const fetchData = async () => {
      setLoading(true);
      setSummaryLoading(true);
      try {
        const [reportsRes, summaryRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/reports"),
          axios.get("http://localhost:5000/api/admin/reports/summary"),
        ]);
        setReports(reportsRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleViewReport = async (report, customFilter = filter) => {
    console.log("Send filter:", customFilter);
    setSelectedReport(report);
    setReportLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams(customFilter).toString();
      const res = await axios.get(
        `http://localhost:5000/api/admin/reports/${report._id}?${params}`
      );
      setReportData(res.data);
    } catch {
      setReportData({ error: "Тайлан авахад алдаа гарлаа" });
    }
    setReportLoading(false);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const titleMatch = r.title
        .toLowerCase()
        .includes(searchReport.toLowerCase());
      const statusMatch = statusFilter === "all" || r.status === statusFilter;
      return titleMatch && statusMatch;
    });
  }, [reports, searchReport, statusFilter]);

  const reportStatuses = useMemo(() => {
    const statuses = new Set(reports.map((r) => r.status));
    return ["all", ...Array.from(statuses)];
  }, [reports]);

  if (loading) return <div>Уншиж байна...</div>;

  function ReportPreview({ report, data, onFilter, filter }) {
    // ... (This component remains unchanged)
    if (!data) return null;

    // Захиалгын тайлан
    if (report._id === "orders") {
      return (
        <div>
          <div className="mb-4 flex gap-2 items-center">
            <span className="font-semibold">Бүлэглэх:</span>
            <select
              value={filter.groupBy}
              onChange={(e) => {
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
              onChange={(e) => {
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
              onChange={(e) => {
                const updatedFilter = { ...filter, to: e.target.value };
                setFilter(updatedFilter);
                handleViewReport(report, updatedFilter);
              }}
              className="border p-1 rounded"
              placeholder="Дуусах огноо"
            />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Нийт захиалга:</span>{" "}
            {data.stats?.[0]?.totalOrders || "-"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Нийт орлого:</span>{" "}
            {data.stats
              ?.reduce((a, b) => a + (b.totalRevenue || 0), 0)
              ?.toLocaleString() || "-"}
            ₮
          </div>
          <div className="mb-2">
            <span className="font-semibold">Дундаж захиалгын үнэ:</span>{" "}
            {data.stats?.length
              ? Math.round(
                  data.stats.reduce((a, b) => a + (b.avgOrderValue || 0), 0) /
                    data.stats.length
                ).toLocaleString()
              : "-"}
            ₮
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
                  <li key={k}>
                    {k}: {v}
                  </li>
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
                  <td className="p-2 border">
                    {row.totalRevenue?.toLocaleString()}₮
                  </td>
                  <td className="p-2 border">
                    {row.avgOrderValue?.toLocaleString()}₮
                  </td>
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
                      ? p.stock.map((s) => (
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
                                verticalAlign: "middle",
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
                  <td className="p-2 border">
                    {c.totalSaved?.toLocaleString()}₮
                  </td>
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
                  <td className="p-2 border">
                    {row.revenue?.toLocaleString()}₮
                  </td>
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
                  <td className="p-2 border">{c.name ? c.name : c._id}</td>
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
          <div className="mb-2 font-semibold">
            Нөөц багатай бүтээгдэхүүнүүд:
          </div>
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
                      .filter((s) => s.quantity <= (filter.threshold || 5))
                      .map((s) => (
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
                              verticalAlign: "middle",
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

    // Хэрэглэгчийн сегментчилэл
    if (report._id === "user-segmentation") {
      return (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg shadow">
              <h4 className="font-bold text-blue-800">Шинэ хэрэглэгчид</h4>
              <p className="text-2xl font-semibold">{data.newUsers?.count}</p>
              <p className="text-xs text-gray-600">
                {data.newUsers?.description}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <h4 className="font-bold text-green-800">
                Давтан худалдан авагчид
              </h4>
              <p className="text-2xl font-semibold">
                {data.repeatCustomers?.count}
              </p>
              <p className="text-xs text-gray-600">
                {data.repeatCustomers?.description}
              </p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg shadow">
              <h4 className="font-bold text-red-800">Идэвхгүй хэрэглэгчид</h4>
              <p className="text-2xl font-semibold">
                {data.inactiveUsers?.count}
              </p>
              <p className="text-xs text-gray-600">
                {data.inactiveUsers?.description}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">Шилдэг 10 худалдан авагч</h4>
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr>
                  <th className="p-2 border">Нэр</th>
                  <th className="p-2 border">И-мэйл</th>
                  <th className="p-2 border text-right">Нийт зарцуулалт</th>
                </tr>
              </thead>
              <tbody>
                {data.topSpenders?.users.map((user, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border text-right">
                      {user.totalSpent.toLocaleString()}₮
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Цагийн бүсчлэлийн тайлан
    if (report._id === "sales-by-time") {
      // Долоо хоногийн гараг: 0-6 (0=Ням, 6=Бямба)
      const days = [
        "Ням",
        "Даваа",
        "Мягмар",
        "Лхагва",
        "Пүрэв",
        "Баасан",
        "Бямба",
      ];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold mb-2">Долоо хоногийн гарагаар</h4>
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr>
                  <th className="p-2 border">Гараг</th>
                  <th className="p-2 border text-right">Нийт орлого</th>
                  <th className="p-2 border text-right">Захиалгын тоо</th>
                </tr>
              </thead>
              <tbody>
                {data.byDayOfWeek?.map((day) => {
                  // _id нь 0-оос эсвэл 1-ээс эхэлж байгааг шалгаж, зөв индекс авах
                  let idx = Number(day._id ?? day.day ?? 0);
                  // 1-ээс эхэлдэг бол -1, 0-оос эхэлдэг бол шууд
                  if (idx > 6) idx = idx % 7;
                  if (idx > 0 && days.length === 7 && idx <= 7) idx = idx - 1;
                  if (idx < 0 || idx > 6) idx = 0;
                  return (
                    <tr key={day._id ?? day.day ?? Math.random()}>
                      <td className="p-2 border">{days[idx] || "-"}</td>
                      <td className="p-2 border text-right">
                        {day.totalSales != null ? day.totalSales.toLocaleString() : "-"}₮
                      </td>
                      <td className="p-2 border text-right">{day.totalOrders ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-bold mb-2">Өдрийн цагаар (0-23)</h4>
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr>
                  <th className="p-2 border">Цаг</th>
                  <th className="p-2 border text-right">Нийт орлого</th>
                  <th className="p-2 border text-right">Захиалгын тоо</th>
                </tr>
              </thead>
              <tbody>
                {data.byHourOfDay?.map((hour) => (
                  <tr key={hour._id ?? hour.hour ?? Math.random()}>
                    <td className="p-2 border">
                      {hour._id ?? hour.hour ?? "-"}:00 - {hour._id ?? hour.hour ?? "-"}:59
                    </td>
                    <td className="p-2 border text-right">
                      {hour.totalSales != null ? hour.totalSales.toLocaleString() : "-"}₮
                    </td>
                    <td className="p-2 border text-right">
                      {hour.totalOrders ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Хамтдаа зарагддаг барааны тайлан
    if (report._id === "market-basket") {
      return (
        <div>
          <h4 className="font-bold mb-2">
            Хамгийн их хамт зарагдсан барааны хослолууд
          </h4>
          {data.pairs?.length > 0 ? (
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr>
                  <th className="p-2 border">Бараа А</th>
                  <th className="p-2 border">Бараа Б</th>
                  <th className="p-2 border text-right">Хамт зарагдсан тоо</th>
                </tr>
              </thead>
              <tbody>
                {data.pairs.map((pair, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{pair.productA}</td>
                    <td className="p-2 border">{pair.productB}</td>
                    <td className="p-2 border text-right">{pair.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Хамт зарагдсан барааны хослол олдсонгүй.</p>
          )}
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
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setisSidebarOpen(!issidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300",
          issidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0"
        )}
      >
        <div className="text-xl font-bold text-green-700 p-6">
          🛍 Admin Panel
        </div>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Тайлангийн самбар</h1>

          {/* Нэгдсэн мэдээллийн хэсэг */}
          {summaryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-lg shadow animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard
                  title="Өнөөдрийн орлого"
                  value={summary.todaysRevenue}
                  icon={DollarSign}
                  unit="₮"
                />
                <SummaryCard
                  title="Хүлээгдэж буй захиалга"
                  value={summary.pendingOrders}
                  icon={Clock}
                />
                <SummaryCard
                  title="Энэ сарын шинэ хэрэглэгчид"
                  value={summary.newUsersThisMonth}
                  icon={UserPlus}
                />
                <SummaryCard
                  title="Нөөц багатай бараа"
                  value={summary.lowStockProducts}
                  icon={Archive}
                />
              </div>
            )
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Бүх тайлангийн жагсаалт</h2>
            <div className="flex flex-col md:flex-row gap-2 mb-6">
              <input
                type="text"
                placeholder="Тайлангийн нэрээр хайх..."
                className="border p-2 rounded w-full md:w-1/2"
                value={searchReport}
                onChange={(e) => setSearchReport(e.target.value)}
              />
              <div className="flex items-center gap-2 w-full md:w-1/2">
                <label className="font-semibold whitespace-nowrap">
                  Төлөв:
                </label>
                <select
                  className="border p-2 rounded w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {reportStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "Бүгд" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">Тайлан олдсонгүй</p>
              ) : (
                (() => {
                  const items = [];
                  for (let i = 0; i < filteredReports.length; i++) {
                    const report = filteredReports[i];
                    const isOpen = selectedReport?._id === report._id;
                    if (isOpen) {
                      // Дэлгэрэнгүй нээгдсэн тайланг col-span-2 болгож, дараагийн баганын картуудыг доош нь шахна
                      items.push(
                        <div
                          key={report._id || i}
                          className="bg-white p-2 md:p-4 rounded-lg shadow flex flex-col justify-between col-span-1 md:col-span-2"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                            <span className={clsx(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              {
                                "bg-green-100 text-green-800": report.status === "Бэлэн",
                                "bg-yellow-100 text-yellow-800": report.status !== "Бэлэн",
                              }
                            )}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{report.date}</p>
                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                            >
                              👁 Дэлгэрэнгүй
                            </button>
                            <a
                              href={`http://localhost:5000/api/admin/reports/${report._id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium text-center"
                            >
                              📥 PDF
                            </a>
                          </div>
                          {/* Дэлгэрэнгүй зөвхөн энэ блок дотор col-span-2 өргөнтэй гарна */}
                          <div className="mt-4 border-t pt-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Дэлгэрэнгүй</span>
                              <button
                                onClick={() => {
                                  setSelectedReport(null);
                                  setReportData(null);
                                }}
                                className="text-red-500 hover:underline"
                              >
                                Хаах
                              </button>
                            </div>
                            <div className="mt-2">
                              {reportLoading ? (
                                <p>Уншиж байна...</p>
                              ) : reportData?.error ? (
                                <p className="text-red-600">{reportData.error}</p>
                              ) : (
                                <ReportPreview
                                  report={selectedReport}
                                  data={reportData}
                                  filter={filter}
                                  onFilter={(f) => {
                                    setFilter(f);
                                    handleViewReport(selectedReport, f);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                      // 2 баганад 1 мөр эзэлж байгаа тул, дараагийн баганын картуудыг алгасах
                      if (i % 2 === 0) i++; // even index дээр дэлгэрэнгүй нээгдсэн бол дараагийнхыг алгасна
                    } else {
                      items.push(
                        <div
                          key={report._id || i}
                          className="bg-white p-4 rounded-lg shadow flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                            <span className={clsx(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              {
                                "bg-green-100 text-green-800": report.status === "Бэлэн",
                                "bg-yellow-100 text-yellow-800": report.status !== "Бэлэн",
                              }
                            )}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{report.date}</p>
                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                            >
                              👁 Дэлгэрэнгүй
                            </button>
                            <a
                              href={`http://localhost:5000/api/admin/reports/${report._id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium text-center"
                            >
                              📥 PDF
                            </a>
                          </div>
                        </div>
                      );
                    }
                  }
                  return items;
                })()
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

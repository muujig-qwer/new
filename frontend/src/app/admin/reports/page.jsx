"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  PackageCheck,
  PlusCircle,
  Tag,
  Layers,
  Settings,
  FileBarChart2,
  DollarSign,
  Clock,
  UserPlus,
  Archive,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const SummaryCard = ({ title, value, icon: Icon, unit = "" }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-3">
    <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
      <Icon className="h-5 w-5 text-green-700" />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-xs font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {value?.toLocaleString()}
        {unit}
      </p>
    </div>
  </div>
);

const ReportCard = ({ report, index, onViewReport, onToggleExpanded, isExpanded }) => (
  <div className="bg-white border rounded-lg shadow-sm mb-3">
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-tight pr-2">
          {report.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            report.status === "Бэлэн"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {report.status}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">{report.date}</p>
      
      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-xs font-medium flex items-center justify-center gap-1"
          onClick={() => onViewReport(report)}
        >
          <Eye className="h-3 w-3" />
          Дэлгэрэнгүй
        </button>
        <button
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-xs font-medium flex items-center justify-center gap-1"
          onClick={() => window.open(`http://localhost:5000/api/admin/reports/${report._id}/pdf`, '_blank')}
        >
          <Download className="h-3 w-3" />
          PDF
        </button>
      </div>
    </div>
    
    {isExpanded && (
      <div className="border-t bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-sm">Тайлангийн мэдээлэл</h4>
          <button
            className="text-gray-500 hover:text-red-500 text-xs"
            onClick={() => onToggleExpanded(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Төлөв: {report.status}</p>
          <p>Сүүлд шинэчлэгдсэн: {report.date}</p>
        </div>
      </div>
    )}
  </div>
);

export default function AdminReportsPage() {
  const [reports, setReports] = useState([
    { _id: '1', title: 'Орлогын тайлан - 2024 оны 12 дугаар сар', status: 'Бэлэн', date: '2024-12-15' },
    { _id: '2', title: 'Борлуулалтын тайлан - Сүүлийн 30 хоног', status: 'Боловсруулж байна', date: '2024-12-14' },
    { _id: '3', title: 'Хэрэглэгчдийн статистик тайлан', status: 'Бэлэн', date: '2024-12-13' },
    { _id: '4', title: 'Бүтээгдэхүүний нөөцийн тайлан', status: 'Бэлэн', date: '2024-12-12' },
    { _id: '5', title: 'Захиалгын дэлгэрэнгүй тайлан', status: 'Боловсруулж байна', date: '2024-12-11' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [searchReport, setSearchReport] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [summary, setSummary] = useState({
    todaysRevenue: 2450000,
    pendingOrders: 23,
    newUsersThisMonth: 156,
    lowStockProducts: 8
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);

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

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    setExpandedReport(report._id);
    setReportLoading(true);
    setReportData(null);
    
    // Simulate API call
    setTimeout(() => {
      setReportData({ success: true, message: 'Тайлан амжилттай ачаалагдлаа' });
      setReportLoading(false);
    }, 1000);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const titleMatch = r.title.toLowerCase().includes(searchReport.toLowerCase());
      const statusMatch = statusFilter === "all" || r.status === statusFilter;
      return titleMatch && statusMatch;
    });
  }, [reports, searchReport, statusFilter]);

  const reportStatuses = useMemo(() => {
    const statuses = new Set(reports.map((r) => r.status));
    return ["all", ...Array.from(statuses)];
  }, [reports]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="text-lg font-bold text-green-700">🛍 Admin Panel</div>
          <button
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b lg:justify-center">
          <div className="text-lg font-bold text-green-700">🛍 Admin Panel</div>
          <button
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(({ key, label, icon: Icon, href }) => (
            <a
              key={key}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                key === "reports"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Тайлангийн самбар</h1>

            {/* Summary Cards */}
            {summaryLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <SummaryCard title="Өнөөдрийн орлого" value={summary.todaysRevenue} icon={DollarSign} unit="₮" />
                  <SummaryCard title="Хүлээгдэж буй захиалга" value={summary.pendingOrders} icon={Clock} />
                  <SummaryCard title="Энэ сарын шинэ хэрэглэгчид" value={summary.newUsersThisMonth} icon={UserPlus} />
                  <SummaryCard title="Нөөц багатай бараа" value={summary.lowStockProducts} icon={Archive} />
                </div>
              )
            )}

            {/* Reports Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Тайлангийн жагсаалт</h2>
                
                {/* Search and Filter Toggle */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Тайлангийн нэрээр хайх..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={searchReport}
                      onChange={(e) => setSearchReport(e.target.value)}
                    />
                  </div>
                  
                  <button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    Шүүлтүүр
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Төлөв</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  </div>
                )}
              </div>

              {/* Reports List - Mobile Cards */}
              <div className="lg:hidden">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded flex-1"></div>
                          <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileBarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Тайлан олдсонгүй</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {filteredReports.map((report, idx) => (
                      <ReportCard
                        key={report._id}
                        report={report}
                        index={idx}
                        onViewReport={handleViewReport}
                        onToggleExpanded={setExpandedReport}
                        isExpanded={expandedReport === report._id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Reports Table - Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тайлангийн нэр</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сүүлд шинэчлэгдсэн</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Тайлан олдсонгүй
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report, idx) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                report.status === "Бэлэн"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                                Дэлгэрэнгүй
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                onClick={() => window.open(`http://localhost:5000/api/admin/reports/${report._id}/pdf`, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
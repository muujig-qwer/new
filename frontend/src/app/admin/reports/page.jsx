"use client";
import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with your real API endpoint
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Тайлан</h1>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Тайлангийн нэр</th>
                <th className="p-2 border">Огноо</th>
                <th className="p-2 border">Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    Тайлан олдсонгүй
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <tr key={report._id || idx}>
                    <td className="p-2 border">{idx + 1}</td>
                    <td className="p-2 border">{report.title}</td>
                    <td className="p-2 border">{report.date}</td>
                    <td className="p-2 border">{report.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
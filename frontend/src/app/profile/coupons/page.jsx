'use client'
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function MyCouponsPage() {
  const { data: session, status } = useSession();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetch("http://localhost:5000/api/coupon/user", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCoupons(data.coupons || []);
        setLoading(false);
      });
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600 mb-4">Купон харахын тулд нэвтэрнэ үү.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Миний купонууд</h1>
      <div className="bg-white rounded shadow p-4">
        {coupons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Танд купон байхгүй байна.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Код</th>
                <th className="text-left py-2">Хөнгөлөлт</th>
                <th className="text-left py-2">Дуусах огноо</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="py-1">{c.code}</td>
                  <td className="py-1">{c.discount}%</td>
                  <td className="py-1">
                    {c.expires ? new Date(c.expires).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
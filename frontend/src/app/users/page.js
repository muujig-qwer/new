'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Та нэвтрээгүй байна.')
      return
    }

    axios
      .get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data)
      })
      .catch(() => {
        setError('Хэрэглэгчдийн мэдээлэл авахад алдаа гарлаа.')
      })
  }, [])

  if (error) {
    return <p className="text-red-600 text-center mt-10">{error}</p>
  }

  if (!users.length) {
    return <p className="text-center mt-10">Хэрэглэгчид ачааллаж байна...</p>
  }

  return (
    <div className="max-w-4xl mx-auto  mt-10 p-4">
      <h1 className="text-2xl font-bold  mb-6">Хэрэглэгчдийн жагсаалт</h1>
      <table className="w-full border table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Нэр</th>
            <th className="p-2 border">Имэйл</th>
            <th className="p-2 border">Зураг</th>
            <th className="p-2 border">Эрх</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u._id} className="text-center">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">
                {u.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${u.image}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mx-auto object-cover"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="p-2 border">
                <span className={u.role === 'admin' ? 'text-red-600 font-bold' : 'text-gray-700'}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

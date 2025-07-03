'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'  // Таны CartContext байрлалын дагуу өөрчлөх
import { signIn, useSession } from "next-auth/react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUserId } = useCart()  // setUserId-г авах

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === "loading") return; // session бүрэн ачаалагдаагүй бол юу ч хийхгүй
    if (session) {
      if (session.user.role === "delivery") {
        router.push("/staff/dashboard");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Имэйлээ оруулна уу')
      return
    }
    setError('')
    setStep(2)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.user._id)

      setUserId(res.data.user._id)  // ЭНЭГЭЭР context-д userId-г шинэчлэх

      router.push('/')
    } catch (err) {
      setError('Нэвтрэх үед алдаа гарлаа')
    }
  }

  if (status === "loading") {
    return <div className="text-center py-10">Түр хүлээнэ үү...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Нэвтрэх
        </h1>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Имэйл хаяг
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg text-center font-medium hover:bg-gray-800 transition"
            >
              Үргэлжлүүлэх
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Нууц үг
              </label>
              <input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg text-center font-medium hover:bg-gray-800 transition"
            >
              Нэвтрэх
            </button>
            <button
              type="button"
              className="w-full text-gray-500 underline text-sm mt-2"
              onClick={() => setStep(1)}
            >
              Буцах
            </button>
          </form>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl: '/login' })}
          className="bg-red-500 text-white px-4 py-2 rounded w-full mt-4"
        >
          Google-ээр нэвтрэх
        </button>

        <p className="text-sm text-center text-gray-500 mt-6">
          Шинэ хэрэглэгч үү?{' '}
          <a href="/register" className="underline hover:text-black">
            Бүртгүүлэх
          </a>
        </p>
      </div>
    </div>
  )
}

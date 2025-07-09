"use client"
import { useState } from "react"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Heart, User, Lock, PawPrint } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", password: "" })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}api/auth/login`, form, {
        withCredentials: true,
      })
      return res.data
    },
    onSuccess: (data) => {
      alert("Login successful!")
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/pets")
    },
    onError: (err) => {
      alert(err.response.data.msg || "Login failed")
    },
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-orange-200 opacity-20">
          <PawPrint size={60} />
        </div>
        <div className="absolute top-32 right-20 text-amber-200 opacity-20">
          <Heart size={40} />
        </div>
        <div className="absolute bottom-20 left-20 text-orange-200 opacity-20">
          <PawPrint size={80} />
        </div>
        <div className="absolute bottom-40 right-10 text-amber-200 opacity-20">
          <Heart size={50} />
        </div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Main login card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4">
              <Heart className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to find your perfect companion</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Username field */}
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-amber-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Heart className="mr-2" size={20} />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/register" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Sign up here
              </a>
            </p>
          </div>

          {/* Decorative paw prints */}
          <div className="flex justify-center mt-6 space-x-2">
            <PawPrint className="text-orange-200" size={16} />
            <PawPrint className="text-amber-200" size={16} />
            <PawPrint className="text-orange-200" size={16} />
          </div>
        </div>

        {/* Bottom text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">🐾 Connecting hearts, one paw at a time 🐾</p>
        </div>
      </div>
    </div>
  )
}

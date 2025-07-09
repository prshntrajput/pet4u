"use client"
import { useState } from "react"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Heart, User, Lock, PawPrint, UserPlus, Shield } from "lucide-react"

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", password: "", role: "user" })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}api/auth/register`, form, {
        withCredentials: true,
      })
      return res.data
    },
    onSuccess: () => {
      alert("Registration successful!")
      router.push("/login")
    },
    onError: (err) => {
      alert(err.response.data.msg || "Registration failed")
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
        <div className="absolute top-1/2 left-1/4 text-orange-100 opacity-15">
          <UserPlus size={45} />
        </div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Main register card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4">
              <UserPlus className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Our Family!</h1>
            <p className="text-gray-600">Create an account to start your pet adoption journey</p>
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
                  placeholder="Choose a username"
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
                  placeholder="Create a secure password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="relative">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="user">🐾 Pet Adopter - Looking for a companion</option>
                  <option value="seller">🏠 Pet Shelter/Seller - Helping pets find homes</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Register button */}
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-amber-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2" size={20} />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Terms and conditions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-orange-500 hover:text-orange-600 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-orange-500 hover:text-orange-600 underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Sign in here
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
          <p className="text-gray-500 text-sm">🏠 Building a community of pet lovers 🏠</p>
        </div>
      </div>
    </div>
  )
}

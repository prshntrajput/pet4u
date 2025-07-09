// components/ProtectedRoute.jsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) return <div className="text-center p-4">Checking authentication...</div>

  return children
}

"use client"
import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { Heart, MessageCircle, Clock, CheckCircle, XCircle, PawPrint, User, AlertCircle, Loader2 } from "lucide-react"

export default function SellerRequestDashboard() {
  const [session, setSession] = useState(null)
  const queryClient = useQueryClient()

  // ✅ Load session from localStorage
  useEffect(() => {
    const localSession = JSON.parse(localStorage.getItem("user"))
    setSession(localSession)
  }, [])

  // ✅ Fetch adoption requests from backend (port 8002)
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adoption-requests"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8002/api/adopt/requests", {
        withCredentials: true,
      })
      return res.data
    },
    enabled: session?.role === "seller", // ✅ FIXED: Correct condition
  })

  // ✅ Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (reqId) => {
      return axios.put(`http://localhost:8002/api/adopt/accept/${reqId}`, {}, { withCredentials: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adoption-requests"])
    },
  })

  // ✅ Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (reqId) => {
      return axios.put(`http://localhost:8002/api/adopt/reject/${reqId}`, {}, { withCredentials: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adoption-requests"])
    },
  })

  // ✅ Debug logging
  useEffect(() => {
    console.log("Session:", session)
    console.log("Requests:", requests)
  }, [session, requests])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 animate-pulse">
            <User className="text-white" size={28} />
          </div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4">
            <Loader2 className="text-white animate-spin" size={28} />
          </div>
          <p className="text-gray-600">Loading adoption requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <p className="text-red-500 font-semibold">Error loading requests</p>
          <p className="text-gray-600 text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "text-amber-600",
          bg: "bg-amber-100",
          icon: Clock,
          label: "Pending Review",
        }
      case "accepted":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: CheckCircle,
          label: "Accepted",
        }
      case "rejected":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: XCircle,
          label: "Rejected",
        }
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: Clock,
          label: status,
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-orange-200 opacity-20">
          <PawPrint size={60} />
        </div>
        <div className="absolute top-40 right-20 text-amber-200 opacity-20">
          <Heart size={40} />
        </div>
        <div className="absolute bottom-32 left-20 text-orange-200 opacity-20">
          <PawPrint size={80} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 shadow-lg">
            <Heart className="text-white" size={36} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Adoption Requests</h1>
          <p className="text-gray-600 text-lg">Manage requests from potential pet parents</p>
          <div className="flex justify-center mt-4 space-x-2">
            <PawPrint className="text-orange-300" size={20} />
            <Heart className="text-amber-300" size={20} />
            <PawPrint className="text-orange-300" size={20} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  {requests?.filter((req) => req.status === "pending").length || 0}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  {requests?.filter((req) => req.status === "accepted").length || 0}
                </p>
                <p className="text-gray-600">Accepted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Heart className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{requests?.length || 0}</p>
                <p className="text-gray-600">Total Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests?.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full mb-6">
              <Heart className="text-orange-600" size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No adoption requests yet</h3>
            <p className="text-gray-500 mb-6">
              When people are interested in your pets, their requests will appear here
            </p>
            <div className="flex justify-center space-x-2">
              <PawPrint className="text-orange-300" size={20} />
              <Heart className="text-amber-300" size={20} />
              <PawPrint className="text-orange-300" size={20} />
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests?.map((req) => {
              const statusConfig = getStatusConfig(req.status)
              const StatusIcon = statusConfig.icon

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Pet and User Info */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                            <PawPrint className="text-orange-500" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">
                              {req.pet?.name || "Unknown Pet"}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <User className="mr-2" size={16} />
                              <span>
                                Requested by: <strong>{req.user?.name || "Unknown User"}</strong>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                <StatusIcon className="mr-1" size={16} />
                                {statusConfig.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => acceptMutation.mutate(req._id)}
                              disabled={acceptMutation.isPending}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
                            >
                              {acceptMutation.isPending ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(req._id)}
                              disabled={rejectMutation.isPending}
                              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
                            >
                              {rejectMutation.isPending ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <XCircle size={18} />
                              )}
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {req.status === "accepted" && (
                          <Link href={`/chat/${req.user._id}`}>
                            <button className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                              <MessageCircle size={18} />
                              <span>Message User</span>
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Debug Section - Hidden in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug Information</h3>
            <pre className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 overflow-auto max-h-64">
              {JSON.stringify(requests, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

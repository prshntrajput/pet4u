"use client"
import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { Send, MessageCircle, Heart, PawPrint, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/app/_components/ProtectedRoutes"

// ✅ Socket client instance
const socket = io("http://localhost:8002", {
  withCredentials: true,
})

export default function ChatPage() {
  const params = useParams()
  const otherUserId = params.receiverId
  console.log(otherUserId)

  // 👇 replace this with actual logged-in user logic
  const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null
  const currentUserId = currentUser?.id
  const [text, setText] = useState("")
  const queryClient = useQueryClient()
  const messagesEndRef = useRef(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ✅ Fetch messages using TanStack Query
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", currentUserId, otherUserId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:8002/api/messages/${currentUserId}/${otherUserId}`, {
        withCredentials: true,
      })
      return res.data.messages
    },
    enabled: !!currentUserId && !!otherUserId,
  })

  // ✅ Socket listeners
  useEffect(() => {
    if (!currentUserId) return
    socket.emit("addUser", currentUserId)
    socket.on("newMessage", (msg) => {
      // Add new message if it's for this chat
      if (
        (msg.from === otherUserId && msg.to === currentUserId) ||
        (msg.from === currentUserId && msg.to === otherUserId)
      ) {
        queryClient.setQueryData(["messages", currentUserId, otherUserId], (old = []) => [...old, msg])
      }
    })
    return () => socket.off("newMessage")
  }, [currentUserId, otherUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ✅ Send message
  const sendMessage = () => {
    if (!text.trim()) return
    socket.emit("sendMessage", {
      from: currentUserId,
      to: otherUserId,
      text,
    })
    setText("")
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 animate-pulse">
            <MessageCircle className="text-white" size={28} />
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
    <div className="min-h-s>creen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <Link href="/pets" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Chat with User {otherUserId}</h2>
                <div className="flex items-center space-x-1 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <Heart className="text-white/80" size={20} />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden bg-white/50 backdrop-blur-sm">
          <div className="h-full overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 140px)" }}>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full mb-4">
                  <MessageCircle className="text-orange-600" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation!</h3>
                <p className="text-gray-500">Send your first message about this adorable pet</p>
                <div className="flex justify-center mt-4 space-x-2">
                  <PawPrint className="text-orange-300" size={16} />
                  <Heart className="text-amber-300" size={16} />
                  <PawPrint className="text-orange-300" size={16} />
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === currentUserId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      msg.from === currentUserId
                        ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md border border-orange-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-xs mt-1 ${msg.from === currentUserId ? "text-white/80" : "text-gray-500"}`}>
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-orange-100 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message about this pet..."
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <div className="absolute right-3 bottom-3 text-gray-400">
                <PawPrint size={16} />
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="bg-gradient-to-r from-orange-400 to-amber-400 text-white p-3 rounded-2xl hover:from-orange-500 hover:to-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center mt-3 space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart size={14} className="text-orange-400" />
              <span>Discussing pet adoption</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center space-x-1">
              <PawPrint size={14} className="text-amber-400" />
              <span>Be kind and respectful</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

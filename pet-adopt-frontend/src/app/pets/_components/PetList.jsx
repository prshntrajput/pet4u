"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart, MessageCircle, Clock, PawPrint, MapPin, Calendar } from "lucide-react"

export default function PetsPage() {
  const [pets, setPets] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get("http://localhost:8002/api/pets")
        setPets(res.data)
      } catch (error) {
        console.error("Error fetching pets:", error)
      } finally {
        setLoading(false)
      }
    }

    const localSession = JSON.parse(localStorage.getItem("user"))
    setSession(localSession)
    fetchPets()
  }, [])

  const handleAdopt = async (petId) => {
    try {
      const res = await axios.post(`http://localhost:8002/api/adopt`, { petId }, { withCredentials: true })
      alert("Adoption request sent!")
      queryClient.invalidateQueries(["adopt-status", petId])
    } catch (err) {
      alert("Error sending request")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 animate-pulse">
              <PawPrint className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading adorable pets...</h2>
            <p className="text-gray-500">Finding your perfect companion</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <Heart className="text-white" size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Companion</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover amazing pets waiting for their forever homes. Each one has a unique story and lots of love to give.
          </p>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="container mx-auto px-4 py-8">
        {pets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No pets available right now</h2>
            <p className="text-gray-500">Check back soon for new furry friends!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet._id} pet={pet} session={session} handleAdopt={handleAdopt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PetCard({ pet, session, handleAdopt }) {
  const { data: adoptStatus } = useQuery({
    queryKey: ["adopt-status", pet._id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:8002/api/adopt/status/${pet._id}`, {
        withCredentials: true,
      })
      return res.data
    },
    enabled: !!session?.id,
  })

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
      {/* Pet Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
        <img
          src={pet.image || `/placeholder.svg?height=200&width=300&text=${pet.name}`}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
            <Heart className="text-orange-400" size={20} />
          </div>
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h2>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{pet.description}</p>
        </div>

        {/* Pet Details */}
        <div className="space-y-2 mb-4">
          {pet.breed && (
            <div className="flex items-center text-sm text-gray-600">
              <PawPrint className="mr-2 text-orange-400" size={16} />
              <span className="font-medium">Breed:</span>
              <span className="ml-1">{pet.breed}</span>
            </div>
          )}
          {pet.age && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 text-orange-400" size={16} />
              <span className="font-medium">Age:</span>
              <span className="ml-1">{pet.age}</span>
            </div>
          )}
          {pet.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 text-orange-400" size={16} />
              <span className="font-medium">Location:</span>
              <span className="ml-1">{pet.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {session?.role === "user" && (
          <div className="mt-4">
            {adoptStatus?.status === "accepted" ? (
              <Link href={`/chat/${adoptStatus.sellerId}`}>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                  <MessageCircle size={18} />
                  <span>Chat with Seller</span>
                </button>
              </Link>
            ) : adoptStatus?.status === "pending" ? (
              <button
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                disabled
              >
                <Clock size={18} />
                <span>Waiting for Approval</span>
              </button>
            ) : (
              <button
                className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white px-4 py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                onClick={() => handleAdopt(pet._id)}
              >
                <Heart size={18} />
                <span>Adopt Me</span>
              </button>
            )}
          </div>
        )}

        {/* Non-user message */}
        {session?.role !== "user" && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 italic">
              {session?.role === "seller" ? "Your listing" : "Login as user to adopt"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

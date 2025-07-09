"use client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useState } from "react"
import { PawPrint, Heart, Camera, FileText, Calendar, Tag, User, Plus, Upload } from "lucide-react"

export default function SellerDashboard() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    age: "",
    breed: "",
    description: "",
    image: "",
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("http://localhost:8002/api/pets", form, {
        withCredentials: true,
      })
      return res.data
    },
    onSuccess: () => {
      alert("Pet added!")
      setForm({ name: "", age: "", breed: "", description: "", image: "" })
    },
    onError: (err) => {
      alert(err?.response?.data?.msg || "Failed to add pet")
    },
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
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
        <div className="absolute bottom-20 right-10 text-amber-200 opacity-20">
          <Heart size={50} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 shadow-lg">
            <Plus className="text-white" size={36} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Add a New Pet</h1>
          <p className="text-gray-600 text-lg">Help a furry friend find their forever home</p>
          <div className="flex justify-center mt-4 space-x-2">
            <PawPrint className="text-orange-300" size={20} />
            <Heart className="text-amber-300" size={20} />
            <PawPrint className="text-orange-300" size={20} />
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
          <form className="space-y-6">
            {/* Pet Name */}
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Pet Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="What's your pet's name?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Age and Breed Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="relative">
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="age"
                    name="age"
                    type="text"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g., 2 years old"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Breed */}
              <div className="relative">
                <label htmlFor="breed" className="block text-sm font-semibold text-gray-700 mb-2">
                  Breed
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="breed"
                    name="breed"
                    type="text"
                    value={form.breed}
                    onChange={handleChange}
                    placeholder="e.g., Golden Retriever"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="relative">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 text-gray-400" size={20} />
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="relative">
              <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                Pet Photo
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/pet-photo.jpg"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                💡 Tip: Add a clear, well-lit photo to help your pet get adopted faster!
              </p>
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-orange-200">
                  <img
                    src={form.image || "/placeholder.svg"}
                    alt="Pet preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 hidden">
                    <div className="text-center">
                      <Upload size={32} className="mx-auto mb-2" />
                      <p>Invalid image URL</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !form.name.trim()}
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-amber-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Adding Pet...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Heart className="mr-3" size={24} />
                  Add Pet to Adoption List
                </div>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-start space-x-3">
              <PawPrint className="text-orange-500 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Tips for a great listing:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use a clear, high-quality photo</li>
                  <li>• Write a detailed, honest description</li>
                  <li>• Include the pet's personality and needs</li>
                  <li>• Mention if they're good with kids or other pets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">🏠 Thank you for helping pets find loving homes! 🏠</p>
        </div>
      </div>
    </div>
  )
}

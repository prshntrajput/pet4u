import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Star, Shield, Phone, MessageCircle, Share2 } from 'lucide-react';

export function PetDetails() {
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Mock data - in real app would come from props or API
  const pet = {
    id: 1,
    name: 'Luna',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    location: 'San Francisco, CA',
    matchScore: 98,
    price: '$250 adoption fee',
    description: "Luna is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks. She's great with kids and other pets, making her the perfect addition to any family.",
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1633722715215-4104b2fc0c3e?auto=format&fit=crop&q=80&w=600',
    ],

    traits: ['Friendly', 'Trained', 'Good with kids', 'Energetic', 'Vaccinated'],
    details: {
      gender: 'Female',
      size: 'Medium',
      color: 'Golden',
      weight: '55 lbs',
      health: 'Vaccinated, Spayed',
      trained: 'Yes',
    },
    shelter: {
      name: 'Happy Paws Shelter',
      rating: 4.8,
      reviews: 156,
      responseTime: 'Usually responds within 2 hours',
    }
  };

  const [selectedImage, setSelectedImage] = useState(pet.images[0]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden">
              <img
                src={selectedImage}
                alt={pet.name}
                className="w-full h-[400px] object-cover rounded-2xl"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {pet.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`flex-shrink-0 ${
                    selectedImage === image ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${pet.name} ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{pet.location}</span>
                  </div>
                </div>
                <div className="bg-pink-50 px-4 py-2 rounded-full">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-pink-500 fill-pink-500" />
                    <span className="font-semibold text-pink-600">{pet.matchScore}% Match</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(pet.details).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-sm text-gray-500 capitalize">{key}</div>
                    <div className="font-medium text-gray-900">{value}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">About {pet.name}</h3>
                <p className="text-gray-600">{pet.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {pet.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Shelter Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{pet.shelter.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{pet.shelter.rating} ({pet.shelter.reviews} reviews)</span>
                  </div>
                </div>
                <button className="text-pink-500 hover:text-pink-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">{pet.shelter.responseTime}</p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-600 transition shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Start Adoption
                </button>
                <button className="w-full border border-pink-500 text-pink-500 py-3 px-4 rounded-xl font-semibold hover:bg-pink-50 transition flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Message Shelter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Shelter</h3>
            <p className="text-gray-600 mb-6">
              Ready to meet {pet.name}? Fill out this quick form and we'll get back to you shortly.
            </p>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <input
                type="tel"
                placeholder="Your Phone"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <textarea
                placeholder="Message (Optional)"
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
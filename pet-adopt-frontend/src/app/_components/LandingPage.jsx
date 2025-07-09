"use client"
import Link from "next/link"
import { Heart, PawPrint, MessageCircle, Shield, Users, Search, Star, ArrowRight, User } from "lucide-react"

export default function LandingPage() {
  const features = [
    {
      icon: Search,
      title: "Find Your Perfect Match",
      description:
        "Browse through hundreds of adorable pets waiting for their forever homes. Filter by breed, age, and location.",
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with pet owners and shelters to learn more about your potential new family member.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All our listings are verified, and we provide a secure platform for all your adoption needs.",
    },
    {
      icon: Heart,
      title: "Love at First Sight",
      description: "Save your favorite pets and get notified when similar pets become available for adoption.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Happy Pet Parent",
      content:
        "I found my best friend Luna through Pet4U. The process was so smooth and the communication with the shelter was excellent!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Pet Shelter Owner",
      content:
        "Pet4U has helped us find homes for over 50 pets this year. The platform makes it easy to connect with loving families.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "First-time Adopter",
      content:
        "As someone new to pet adoption, Pet4U guided me through every step. Now I can't imagine life without my cat Whiskers!",
      rating: 5,
    },
  ]

  const stats = [
    { number: "10,000+", label: "Happy Adoptions" },
    { number: "500+", label: "Partner Shelters" },
    { number: "50,000+", label: "Registered Users" },
    { number: "99%", label: "Success Rate" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-orange-200 opacity-20">
          <PawPrint size={80} />
        </div>
        <div className="absolute top-40 right-20 text-amber-200 opacity-20">
          <Heart size={60} />
        </div>
        <div className="absolute bottom-32 left-20 text-orange-200 opacity-20">
          <PawPrint size={100} />
        </div>
        <div className="absolute bottom-20 right-10 text-amber-200 opacity-20">
          <Heart size={70} />
        </div>
        <div className="absolute top-1/2 left-1/4 text-orange-100 opacity-10">
          <PawPrint size={120} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-8 shadow-2xl">
            <Heart className="text-white" size={48} />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Find Your
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              {" "}
              Perfect{" "}
            </span>
            Companion
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect loving families with adorable pets waiting for their forever homes. Join thousands of happy pet
            parents who found their best friends through Pet4U.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/pets">
              <button className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-orange-500 hover:to-amber-500 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2">
                <Search size={24} />
                <span>Browse Pets</span>
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl border-2 border-orange-200 flex items-center justify-center space-x-2">
                <Users size={24} />
                <span>Join Pet4U</span>
              </button>
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Why Choose Pet4U?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've created the most comprehensive and user-friendly platform for pet adoption, making it easier than
              ever to find your perfect companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-orange-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with Pet4U is simple. Follow these easy steps to find your new best friend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Browse & Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore our extensive database of pets available for adoption. Use filters to find pets that match your
                preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Connect & Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Send adoption requests and chat directly with pet owners or shelters to learn more about your potential
                new family member.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Adopt & Love</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete the adoption process and welcome your new companion home. Start your beautiful journey
                together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Happy Tails & Tales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our community of pet lovers has to say about their Pet4U
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center mr-4">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl p-12 shadow-2xl text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8">
              <Heart className="text-white" size={40} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Best Friend?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy families who have found their perfect companions through Pet4U. Your new best
              friend is waiting for you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="bg-white text-orange-500 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl flex items-center justify-center space-x-2">
                  <Users size={24} />
                  <span>Get Started Free</span>
                </button>
              </Link>
              <Link href="/pets">
                <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border-2 border-white/30 flex items-center justify-center space-x-2">
                  <Search size={24} />
                  <span>Browse Pets Now</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                  <Heart className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold">Pet4U</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Connecting loving families with adorable pets since 2024. Making pet adoption easier, safer, and more
                joyful for everyone.
              </p>
              <div className="flex space-x-2">
                <PawPrint className="text-orange-400" size={20} />
                <Heart className="text-amber-400" size={20} />
                <PawPrint className="text-orange-400" size={20} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/pets" className="hover:text-orange-400 transition-colors">
                    Browse Pets
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-orange-400 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange-400 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/seller-dashboard" className="hover:text-orange-400 transition-colors">
                    List a Pet
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pet4U. Made with ❤️ for pets and their families.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

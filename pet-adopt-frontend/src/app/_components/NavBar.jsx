"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  Menu,
  X,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  Heart,
  PawPrint,
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // ⛔ Hide navbar on login and signup pages
  if (pathname === "/login" || pathname === "/signup" || pathname === "/register") return null

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  // ✅ Logout handler
  const logoutHandler = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const navLinks = [
    //{
    //  href: "/chat",
     // label: "Chat",
     // icon: MessageCircle,
    //  description: "Connect with pet owners",
   // },
    {
      href: "/dashboard/seller",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Your pet journey",
    },
  ]

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold hover:scale-105 transition-transform duration-200"
            >
              <Heart className="text-white mr-1" size={24} />
              <span className="text-white">Pet4U</span>
              <PawPrint className="text-white ml-1" size={20} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-white/20 hover:scale-105 ${
                      isActive ? "bg-white/25 shadow-md" : ""
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                )
              })}

              {/* 🔴 Logout button */}
              <button
                onClick={logoutHandler}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-white/20 hover:scale-105"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500`}
        >
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(({ href, label, icon: Icon, description }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-white/20 ${
                    isActive ? "bg-white/25 shadow-md" : ""
                  }`}
                >
                  <Icon size={20} />
                  <div className="flex flex-col">
                    <span className="text-white">{label}</span>
                    <span className="text-white/80 text-xs">{description}</span>
                  </div>
                </Link>
              )
            })}

            {/* 🔴 Logout button in mobile */}
            <button
              onClick={() => {
                closeMenu()
                logoutHandler()
              }}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl font-medium transition-all duration-200 hover:bg-white/20"
            >
              <LogOut size={20} />
              <div className="flex flex-col">
                <span className="text-white">Logout</span>
                <span className="text-white/80 text-xs">Sign out</span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/80 text-sm">
              <PawPrint size={16} />
              <span>Find your perfect companion</span>
              <Heart size={16} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={closeMenu} />
      )}
    </>
  )
}

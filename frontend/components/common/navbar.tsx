"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface ProfileData {
  email: string
  linkedin: string
  github: string
}

export default function Navbar() {
  const pathname = usePathname()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  // Admin sayfalarında Navbar'ı gösterme
  if (pathname?.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    fetch("http://localhost:5000/api/profile")
      .then((res) => res.json())
      .then((data) => setProfileData(data))
      .catch((err) => console.error("Profile data fetch error:", err))
  }, [])

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/projeler", label: "Projeler" },
    { href: "/deneyim", label: "Deneyim" },
    { href: "/hakkimda", label: "Hakkımda" },
    { href: "/blog", label: "Blog" },
  ]

  return (
    <nav className="w-full py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center items-center relative">
          {/* Navigation Links - Centered */}
          <div className="flex space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-montserrat font-bold text-lg transition-colors relative ${
                  pathname === link.href ? "text-[#404040]" : "text-[#404040] hover:text-gray-600"
                }`}
              >
                {link.label}
                {pathname === link.href && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#404040]"></div>}
              </Link>
            ))}
          </div>

          {/* Social Media Icons - Absolute positioned to the right */}
          <div className="absolute right-0 flex items-center space-x-6">
            {profileData?.email && (
              <a
                href={`mailto:${profileData.email}`}
                className="transition-transform duration-300 hover:scale-110"
                title="Email"
              >
                <img
                  src="/assets/icons/mail.png"
                  alt="Email"
                  className="w-7 h-7 opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            )}
            {profileData?.linkedin && (
              <a
                href={profileData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-110"
                title="LinkedIn"
              >
                <img
                  src="/assets/icons/linkedin.png"
                  alt="LinkedIn"
                  className="w-7 h-7 opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            )}
            {profileData?.github && (
              <a
                href={profileData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-110"
                title="GitHub"
              >
                <img
                  src="/assets/icons/github.png"
                  alt="GitHub"
                  className="w-7 h-7 opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
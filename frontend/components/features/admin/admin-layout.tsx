"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, User, Briefcase, FileText, Home, Users, MessageSquare } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [csrfToken, setCsrfToken] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Login sayfasındaysak auth kontrolü yapma
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    // Oturum durumunu kontrol et
    const checkAuth = async () => {
      try {
        console.log("Auth kontrolü başlıyor...")
        
        // CSRF token'ı al
        const csrfResponse = await fetch("http://localhost:5000/admin/login", {
          credentials: "include",
        })
        
        if (!csrfResponse.ok) {
          console.error("CSRF token alınamadı:", csrfResponse.status)
          router.push("/admin/login")
          return
        }

        const { csrfToken } = await csrfResponse.json()
        console.log("CSRF token alındı")
        setCsrfToken(csrfToken)

        // Oturum kontrolü yap
        const response = await fetch("http://localhost:5000/admin/profile", {
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken
          }
        })

        console.log("Profil kontrolü yapıldı:", response.status)

        if (response.ok) {
          setIsAuthenticated(true)
          console.log("Kullanıcı doğrulandı")
        } else {
          console.log("Kullanıcı doğrulanamadı, login sayfasına yönlendiriliyor")
          router.push("/admin/login")
        }
      } catch (err) {
        console.error("Auth check error:", err)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  const handleLogout = async () => {
    try {
      // CSRF token'ı al
      const csrfResponse = await fetch("http://localhost:5000/admin/login", {
        credentials: "include",
      })
      const { csrfToken } = await csrfResponse.json()

      await fetch("http://localhost:5000/admin/logout", {
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken
        }
      })
      router.push("/admin/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  // Login sayfasındaysak layout'u gösterme
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-[#404040] font-montserrat">Yükleniyor...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router zaten login sayfasına yönlendirecek
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/profile", label: "Profil", icon: User },
    { href: "/admin/projects", label: "Projeler", icon: Briefcase },
    { href: "/admin/experiences", label: "Deneyimler", icon: Briefcase },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/blog-comments", label: "Blog Yorumları", icon: MessageSquare },
    { href: "/admin/visitors", label: "Ziyaretçiler", icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#404040] text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="font-anton text-xl uppercase">Admin Panel</h1>
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                      pathname === item.href ? "bg-gray-700" : ""
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    <span className="font-montserrat">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-white hover:bg-gray-700 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span className="font-montserrat">Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

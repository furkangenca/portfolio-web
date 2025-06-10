"use client"

import { useEffect, useState } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import Link from "next/link"
import { User, Briefcase, FileText, Clock, MessageSquare, Users } from "lucide-react"
import { visitorService } from "@/app/services/visitorService"

interface Stats {
  totalVisitors: number
  onlineUsers: number
  projectCount?: number
  blogCount?: number
  experienceCount?: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")

  const fetchStats = async () => {
    try {
      const response = await visitorService.getStats()
      setStats({
        totalVisitors: response.data.totalVisitors,
        onlineUsers: response.data.onlineUsers
      })
    } catch (err) {
      console.error("Stats fetch error:", err)
      setError("İstatistikler alınamadı")
    }
  }

  useEffect(() => {
    // İlk yükleme
    fetchStats()

    // Her 5 saniyede bir güncelle
    const interval = setInterval(fetchStats, 5000)

    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(interval)
  }, [])

  const adminCards = [
    {
      title: "Profil",
      description: "Profil bilgilerinizi düzenleyin",
      icon: User,
      link: "/admin/profile",
      color: "bg-blue-500",
    },
    {
      title: "Projeler",
      description: "Projelerinizi yönetin",
      icon: Briefcase,
      link: "/admin/projects",
      color: "bg-green-500",
    },
    {
      title: "Deneyimler",
      description: "Deneyimlerinizi yönetin",
      icon: Clock,
      link: "/admin/experiences",
      color: "bg-purple-500",
    },
    {
      title: "Blog",
      description: "Blog yazılarınızı yönetin",
      icon: FileText,
      link: "/admin/blog",
      color: "bg-orange-500",
    },
    {
      title: "Blog Yorumları",
      description: "Blog yorumlarını yönetin",
      icon: MessageSquare,
      link: "/admin/blog-comments",
      color: "bg-pink-500",
    },
    {
      title: "Ziyaretçiler",
      description: "Ziyaretçi istatistiklerini görüntüleyin",
      icon: Users,
      link: "/admin/visitors",
      color: "bg-indigo-500",
    },
  ]

  return (
    <AdminLayout>
      <h1 className="font-anton text-3xl text-[#404040] uppercase mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-montserrat font-medium text-lg mb-4">Ziyaretçi İstatistikleri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500">Toplam Ziyaretçi</p>
                <p className="font-anton text-2xl">{stats.totalVisitors}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500">Çevrimiçi Kullanıcı</p>
                <p className="font-anton text-2xl">{stats.onlineUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link key={index} href={card.link}>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-anton text-xl text-[#404040] mb-2">{card.title}</h3>
                <p className="font-montserrat text-sm text-gray-600">{card.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </AdminLayout>
  )
}


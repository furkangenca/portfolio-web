"use client"

import { useEffect, useState } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Users } from "lucide-react"
import { visitorService } from "@/app/services/visitorService"

interface Visitor {
  ip_address: string
  timestamp: string
  formatted_date: string
  user_agent?: string
  referrer?: string
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await visitorService.getVisitors()
        setVisitors(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Ziyaretçi listesi alınırken hata:", err)
        setError("Ziyaretçi listesi alınamadı")
        setLoading(false)
      }
    }

    fetchVisitors()
  }, [])

  return (
    <AdminLayout>
      <div className="flex items-center gap-2 mb-8">
        <Users className="w-8 h-8 text-[#404040]" />
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Ziyaretçi Listesi</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Adresi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ziyaret Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarayıcı/Cihaz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yönlendiren
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitors.map((visitor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {visitor.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.formatted_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.user_agent || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.referrer || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 
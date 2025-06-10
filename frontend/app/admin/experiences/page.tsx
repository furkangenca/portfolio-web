"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Experience {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  tags: string[]
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [csrfToken, setCsrfToken] = useState("")

  useEffect(() => {
    // CSRF token'ı al
    fetch("http://localhost:5000/admin/login", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      })
      .catch((err) => {
        console.error("CSRF token fetch error:", err)
      })

    // Deneyimleri al
    fetch("http://localhost:5000/api/experiences", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setExperiences(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Experiences fetch error:", err)
        setError("Deneyimler yüklenirken bir hata oluştu.")
        setLoading(false)
      })
  }, [])

  const handleDeleteExperience = async (experienceId: number) => {
    if (!window.confirm("Bu deneyimi silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/experiences/${experienceId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      })

      if (response.ok) {
        setExperiences((prev) => prev.filter((exp) => exp.id !== experienceId))
      } else {
        setError("Deneyim silinemedi.")
      }
    } catch (err) {
      console.error("Experience delete error:", err)
      setError("Deneyim silinirken bir hata oluştu.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#404040] font-montserrat">Yükleniyor...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Deneyimler</h1>
        <Link
          href="/admin/experiences/new"
          className="bg-[#404040] text-white py-2 px-4 rounded-md font-montserrat font-medium hover:bg-gray-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Yeni Deneyim
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Başlık
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tarih Aralığı
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Etiketler
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {experiences.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Henüz deneyim bulunmuyor.
                </td>
              </tr>
            ) : (
              experiences.map((experience) => (
                <tr key={experience.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{experience.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {experience.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/experiences/${experience.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

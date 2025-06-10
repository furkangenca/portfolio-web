"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Project {
  id: number
  title: string
  short_desc: string
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
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

    // Projeleri al
    fetch("http://localhost:5000/api/projects", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Projects fetch error:", err)
        setError("Projeler yüklenirken bir hata oluştu.")
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Silme işlemi başarısız oldu');
      }

      setProjects(projects.filter(project => project.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
      setError(error instanceof Error ? error.message : 'Silme işlemi sırasında bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#404040] font-montserrat">Yükleniyor...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Projeler</h1>
        <Link
          href="/admin/projects/new"
          className="bg-[#404040] text-white py-2 px-4 rounded-md font-montserrat font-medium hover:bg-gray-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Yeni Proje
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
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
                Kısa Açıklama
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
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Henüz proje bulunmuyor.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.short_desc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Düzenle
                      </Link>
                      <button 
                        onClick={() => handleDelete(project.id)}
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

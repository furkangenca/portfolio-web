"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface Experience {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  tags: string[]
}

export default function EditExperiencePage() {
  const router = useRouter()
  const params = useParams()
  const experienceId = params.id

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        setError("CSRF token alınamadı. Lütfen sayfayı yenileyin.")
      })

    // Deneyim detaylarını al
    if (experienceId) {
      fetch(`http://localhost:5000/api/experiences/${experienceId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: Experience) => {
          setFormData({
            title: data.title,
            description: data.description,
            start_date: formatDateForInput(data.start_date),
            end_date: formatDateForInput(data.end_date),
          })
          setTags(data.tags || [])
          setLoading(false)
        })
        .catch((err) => {
          console.error("Experience fetch error:", err)
          setError("Deneyim detayları alınamadı.")
          setLoading(false)
        })
    }
  }, [experienceId])

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // 1. Deneyimi güncelle
      const experienceResponse = await fetch(`http://localhost:5000/admin/experiences/${experienceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!experienceResponse.ok) {
        throw new Error("Deneyim güncellenemedi")
      }

      // 2. Etiketleri güncelle
      console.log('Gönderilen etiketler:', tags);
      const tagsResponse = await fetch(`http://localhost:5000/admin/experiences/${experienceId}/tags`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ tags }),
        credentials: "include",
      });

      if (!tagsResponse.ok) {
        const errorData = await tagsResponse.json();
        console.error('Etiket güncelleme hatası:', errorData);
        throw new Error(errorData.error || errorData.message || "Etiketler güncellenemedi");
      }

      // Başarılı, deneyimler sayfasına yönlendir
      router.push("/admin/experiences")
    } catch (err) {
      console.error("Experience update error:", err)
      setError("Deneyim güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
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
        router.push("/admin/experiences")
      } else {
        throw new Error("Deneyim silinemedi")
      }
    } catch (err) {
      console.error("Experience delete error:", err)
      setError("Deneyim silinirken bir hata oluştu.")
    }
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
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Deneyim Düzenle</h1>
        <Link
          href="/admin/experiences"
          className="text-[#404040] hover:text-gray-600 flex items-center font-montserrat"
        >
          <ArrowLeft size={18} className="mr-2" />
          Deneyimlere Dön
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                required
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Etiketler</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                placeholder="Etiket ekle..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#404040] text-white px-4 py-2 rounded-r-md hover:bg-gray-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white py-2 px-6 rounded-md font-montserrat font-medium hover:bg-red-600 transition-colors flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Deneyimi Sil
          </button>

          <button
            type="submit"
            disabled={saving || !csrfToken}
            className="bg-[#404040] text-white py-2 px-6 rounded-md font-montserrat font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400 flex items-center"
          >
            <Save size={18} className="mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

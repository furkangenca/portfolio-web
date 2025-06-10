"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [saving, setSaving] = useState(false)
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
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Önizleme için
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      if (image) {
        formDataToSend.append("image", image)
      }

      const response = await fetch("http://localhost:5000/admin/blog", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formDataToSend,
        credentials: "include",
      })

      if (response.ok) {
        router.push("/admin/blog")
      } else {
        throw new Error("Blog yazısı oluşturulamadı")
      }
    } catch (err) {
      console.error("Blog post creation error:", err)
      setError("Blog yazısı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Yeni Blog Yazısı</h1>
        <Link href="/admin/blog" className="text-[#404040] hover:text-gray-600 flex items-center font-montserrat">
          <ArrowLeft size={18} className="mr-2" />
          Blog Yazılarına Dön
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
            <label htmlFor="content" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              İçerik
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
              required
            />
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Görsel (Opsiyonel)</label>
            {imagePreview && (
              <div className="mb-4">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 rounded" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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

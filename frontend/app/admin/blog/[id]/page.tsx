"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// dynamic import for ReactQuill to prevent SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor'), { ssr: false });
// import 'react-quill-new/dist/quill.snow.css' // Import Quill styles - moved to RichTextEditor component

interface BlogPost {
  title: string
  content: string
  created_at: string
  image_url?: string
}

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
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

    // Blog yazısı detaylarını al
    if (postId) {
      fetch(`http://localhost:5000/api/blog/${postId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: BlogPost) => {
          setFormData({
            title: data.title,
            content: data.content,
          })
          if (data.image_url) {
            setCurrentImage(data.image_url)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Blog post fetch error:", err)
          setError("Blog yazısı detayları alınamadı.")
          setLoading(false)
        })
    }
  }, [postId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewImage(file)

      // Önizleme için
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCurrentImage = () => {
    setCurrentImage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)

      // Eğer mevcut görsel kaldırıldıysa
      if (currentImage === null) {
        formDataToSend.append("remove_image", "true")
      }

      // Eğer yeni görsel yüklendiyse
      if (newImage) {
        formDataToSend.append("image", newImage)
      }

      const response = await fetch(`http://localhost:5000/admin/blog/${postId}`, {
        method: "PUT",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formDataToSend,
        credentials: "include",
      })

      if (response.ok) {
        router.push("/admin/blog")
      } else {
        throw new Error("Blog yazısı güncellenemedi")
      }
    } catch (err) {
      console.error("Blog post update error:", err)
      setError("Blog yazısı güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Bu blog yazısını silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/blog/${postId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      })

      if (response.ok) {
        router.push("/admin/blog")
      } else {
        throw new Error("Blog yazısı silinemedi")
      }
    } catch (err) {
      console.error("Blog post delete error:", err)
      setError("Blog yazısı silinirken bir hata oluştu.")
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
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Blog Yazısı Düzenle</h1>
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
            <RichTextEditor
              value={formData.content}
              onChange={(content: string) => setFormData((prev) => ({ ...prev, content }))}
            />
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Mevcut Görsel</label>
            {currentImage ? (
              <div className="mb-4 relative">
                <img
                  src={currentImage ? `http://localhost:5000${currentImage}` : "/placeholder.svg?height=256&width=256"}
                  alt="Current"
                  className="max-h-64 rounded"
                />
                <button
                  type="button"
                  onClick={handleRemoveCurrentImage}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Görsel yok</p>
            )}
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Yeni Görsel (Opsiyonel)
            </label>
            {newImagePreview && (
              <div className="mb-4">
                <img src={newImagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 rounded" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-6 rounded-md font-montserrat font-medium hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Yazıyı Sil
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

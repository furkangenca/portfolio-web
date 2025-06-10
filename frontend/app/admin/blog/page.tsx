"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  id: number
  title: string
  created_at: string
  image_url?: string
}

export default function AdminBlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
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

    // Blog yazılarını al
    fetch("http://localhost:5000/api/blog", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setBlogPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Blog posts fetch error:", err)
        setError("Blog yazıları yüklenirken bir hata oluştu.")
        setLoading(false)
      })
  }, [])

  const handleDeletePost = async (postId: number) => {
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
        setBlogPosts((prev) => prev.filter((post) => post.id !== postId))
      } else {
        setError("Blog yazısı silinemedi.")
      }
    } catch (err) {
      console.error("Blog post delete error:", err)
      setError("Blog yazısı silinirken bir hata oluştu.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Blog Yazıları</h1>
        <Link
          href="/admin/blog/new"
          className="bg-[#404040] text-white py-2 px-4 rounded-md font-montserrat font-medium hover:bg-gray-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Yeni Yazı
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">Henüz blog yazısı bulunmuyor.</div>
        ) : (
          blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
              {post.image_url && (
                <div className="relative h-48">
                  <Image
                    src={
                      post.image_url
                        ? `http://localhost:5000${post.image_url}`
                        : "/placeholder.svg?height=192&width=192"
                    }
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-anton text-lg text-[#404040] mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{formatDate(post.created_at)}</p>
                <div className="flex justify-between">
                  <Link href={`/admin/blog/${post.id}`} className="text-blue-600 hover:text-blue-900 flex items-center">
                    <Edit size={16} className="mr-1" />
                    Düzenle
                  </Link>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-900 flex items-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  )
}

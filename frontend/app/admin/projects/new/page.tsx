"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    short_desc: "",
    long_desc: "",
    github_url: "",
  })
  const [technologies, setTechnologies] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
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
        console.log("CSRF token yanıtı:", data);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        } else {
          console.error("CSRF token bulunamadı:", data);
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

  const handleAddTech = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies((prev) => [...prev, newTech.trim()])
      setNewTech("")
    }
  }

  const handleRemoveTech = (tech: string) => {
    setTechnologies((prev) => prev.filter((t) => t !== tech))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages((prev) => [...prev, ...filesArray])

      // Önizleme için
      const newImageUrls: string[] = []
      filesArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImageUrls.push(e.target.result as string)
            if (newImageUrls.length === filesArray.length) {
              setImagePreviewUrls((prev) => [...prev, ...newImageUrls])
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // 1. Önce projeyi oluştur
      const projectResponse = await fetch("http://localhost:5000/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          ...formData,
          short_desc: formData.short_desc || "", // Boş string yerine undefined olmaması için
        }),
        credentials: "include",
      })

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        throw new Error(errorData.message || "Proje oluşturulamadı");
      }

      const projectData = await projectResponse.json()
      console.log('Oluşturulan proje:', projectData); // Debug için

      if (!projectData.projectId) {
        throw new Error("Proje ID'si alınamadı");
      }

      const projectId = projectData.projectId

      // 2. Teknolojileri ekle
      console.log('Gönderilen teknolojiler:', technologies);
      for (const tech of technologies) {
        const techResponse = await fetch(`http://localhost:5000/admin/projects/${projectId}/technologies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ tech_name: tech }),
          credentials: "include",
        });

        if (!techResponse.ok) {
          const errorData = await techResponse.json();
          console.error('Teknoloji ekleme hatası:', errorData);
          throw new Error(errorData.error || errorData.message || `Teknoloji eklenemedi: ${tech}`);
        }
      }

      // 3. Görselleri yükle
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach((image) => {
          formData.append("images", image)
        })

        const uploadResponse = await fetch(`http://localhost:5000/admin/projects/${projectId}/images`, {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          body: formData,
          credentials: "include",
        });

        if (!uploadResponse.ok) {
          throw new Error("Görseller yüklenemedi");
        }
      }

      // Başarılı, projeler sayfasına yönlendir
      router.push("/admin/projects")
    } catch (err) {
      console.error("Project creation error:", err)
      setError(err instanceof Error ? err.message : "Proje oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Yeni Proje</h1>
        <Link href="/admin/projects" className="text-[#404040] hover:text-gray-600 flex items-center font-montserrat">
          <ArrowLeft size={18} className="mr-2" />
          Projelere Dön
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Proje Başlığı
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
            <label htmlFor="short_desc" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Kısa Açıklama
            </label>
            <input
              type="text"
              id="short_desc"
              name="short_desc"
              value={formData.short_desc}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
              required
            />
          </div>

          <div>
            <label htmlFor="long_desc" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              Uzun Açıklama
            </label>
            <textarea
              id="long_desc"
              name="long_desc"
              value={formData.long_desc}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
              required
            />
          </div>

          <div>
            <label htmlFor="github_url" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
              GitHub URL (Opsiyonel)
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
            />
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Teknolojiler</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm">{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
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
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                placeholder="Teknoloji ekle..."
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="bg-[#404040] text-white px-4 py-2 rounded-r-md hover:bg-gray-700"
              >
                Ekle
              </button>
            </div>
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Görseller</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full" />
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

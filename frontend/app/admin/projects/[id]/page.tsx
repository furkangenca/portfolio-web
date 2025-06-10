"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface ProjectDetail {
  title: string
  short_desc: string
  long_desc: string
  github_url: string
  technologies: string[]
  images: string[]
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id

  const [formData, setFormData] = useState({
    title: "",
    short_desc: "",
    long_desc: "",
    github_url: "",
  })
  const [technologies, setTechnologies] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([])
  const [csrfToken, setCsrfToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [projectImages, setProjectImages] = useState<Array<{id: number, image_url: string}>>([])

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

    // Proje detaylarını al
    if (projectId) {
      fetch(`http://localhost:5000/api/projects/${projectId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: any) => {
          setFormData({
            title: data.title,
            short_desc: data.short_desc || "",
            long_desc: data.long_desc,
            github_url: data.github_url || "",
          })
          setTechnologies(data.technologies || [])
          setExistingImages(data.images || [])
          setProjectImages(data.images.map((url: string, index: number) => ({
            id: data.imageIds[index],
            image_url: url
          })))
          setLoading(false)
        })
        .catch((err) => {
          console.error("Project fetch error:", err)
          setError("Proje detayları alınamadı.")
          setLoading(false)
        })
    }
  }, [projectId])

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

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...filesArray])

      // Önizleme için
      const newImageUrls: string[] = []
      filesArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImageUrls.push(e.target.result as string)
            if (newImageUrls.length === filesArray.length) {
              setNewImagePreviewUrls((prev) => [...prev, ...newImageUrls])
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== imageUrl))
  }

  const handleDeleteProject = async () => {
    if (!window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje silinemedi');
      }

      router.push('/admin/projects');
    } catch (err) {
      console.error('Proje silme hatası:', err);
      setError(err instanceof Error ? err.message : 'Proje silinirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // 1. Projeyi güncelle
      const projectResponse = await fetch(`http://localhost:5000/admin/projects/${projectId}`, {
        method: "PUT",
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
        throw new Error(errorData.message || "Proje güncellenemedi");
      }

      // 2. Teknolojileri güncelle
      console.log('Gönderilen teknolojiler:', technologies);
      const techResponse = await fetch(`http://localhost:5000/admin/projects/${projectId}/technologies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ technologies }),
        credentials: "include",
      });

      if (!techResponse.ok) {
        const errorData = await techResponse.json();
        console.error('Teknoloji güncelleme hatası:', errorData);
        throw new Error(errorData.error || errorData.message || "Teknolojiler güncellenemedi");
      }

      // 3. Görselleri güncelle
      // 3.1. Silinen görselleri kaldır
      const originalImages = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        credentials: "include",
      }).then(res => res.json()).then(data => data.images || []);

      const imagesToRemove = originalImages.filter((url: string) => !existingImages.includes(url));
      
      for (const imageUrl of imagesToRemove) {
        const imageToDelete = projectImages.find(img => img.image_url === imageUrl);
        
        if (!imageToDelete) {
          console.error(`Görsel bulunamadı: ${imageUrl}`);
          continue;
        }

        const removeResponse = await fetch(`http://localhost:5000/admin/projects/${projectId}/images/${imageToDelete.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
        });

        if (!removeResponse.ok) {
          throw new Error(`Görsel silinemedi: ${imageUrl}`);
        }
      }

      // 3.2. Yeni görselleri yükle
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((image) => {
          formData.append("images", image);
        });

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
      router.push("/admin/projects");
    } catch (err) {
      console.error("Project update error:", err);
      setError(err instanceof Error ? err.message : "Proje güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setSaving(false);
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Proje Düzenle</h1>
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
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Mevcut Görseller</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:5000${imageUrl}`}
                    alt={`Image ${index}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(imageUrl)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">Yeni Görseller</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {newImagePreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="w-full" />
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleDeleteProject}
            className="bg-red-500 text-white py-2 px-6 rounded-md font-montserrat font-medium hover:bg-red-600 transition-colors flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Projeyi Sil
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

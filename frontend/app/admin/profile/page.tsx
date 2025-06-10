"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import AdminLayout from "@/components/features/admin/admin-layout"
import { Save, Camera } from "lucide-react"
import Image from "next/image"

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  photo_url?: string;
  photo?: File;
  photoPreview?: string;
}

export default function AdminProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    title: "",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    photo_url: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [csrfToken, setCsrfToken] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    // CSRF token'ı al
    fetch("http://localhost:5000/admin/login", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("CSRF token response:", data)
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      })
      .catch((err) => {
        console.error("CSRF token fetch error:", err)
        setMessage({
          type: "error",
          text: "CSRF token alınamadı. Lütfen sayfayı yenileyin.",
        })
      })

    // Profil verilerini al
    fetch("http://localhost:5000/admin/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Profile data:", data)
        setProfileData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Profile data fetch error:", err)
        setLoading(false)
        setMessage({
          type: "error",
          text: "Profil verileri alınamadı. Lütfen daha sonra tekrar deneyin.",
        })
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Önizleme için URL oluştur
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        photo: file,
        photoPreview: previewUrl
      }));
    }
  }

  // Component unmount olduğunda URL'i temizle
  useEffect(() => {
    return () => {
      if (profileData.photoPreview) {
        URL.revokeObjectURL(profileData.photoPreview);
      }
    };
  }, [profileData.photoPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('title', profileData.title);
      formData.append('bio', profileData.bio);
      formData.append('email', profileData.email);
      
      if (profileData.github) formData.append('github', profileData.github);
      if (profileData.linkedin) formData.append('linkedin', profileData.linkedin);
      
      // Eğer yeni bir fotoğraf seçildiyse
      if (profileData.photo instanceof File) {
        formData.append('photo', profileData.photo);
      }

      // CSRF token'ı header olarak ekle
      const response = await fetch('http://localhost:5000/admin/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Oturum süresi dolmuşsa veya yetkisiz erişim varsa
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
      }

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });
      
      // Profil verilerini yeniden yükle
      const profileResponse = await fetch('http://localhost:5000/admin/profile', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Profil bilgileri alınamadı');
      }
      
      const updatedProfileData = await profileResponse.json();
      setProfileData(updatedProfileData);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu'
      });
    } finally {
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
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Profil Düzenle</h1>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                İsim
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                required
              />
            </div>

            <div>
              <label htmlFor="title" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Meslek/Unvan
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={profileData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                required
              />
            </div>

            <div>
              <label htmlFor="bio" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Biyografi
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/assets/icons/mail.png"
                    alt="Email"
                    className="w-5 h-5 opacity-70"
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="photo" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Profil Fotoğrafı
              </label>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={profileData.photoPreview || (profileData.photo_url ? `http://localhost:5000${profileData.photo_url}` : '')}
                  alt="Profil fotoğrafı"
                  className={`w-full h-full object-cover rounded-full ${!profileData.photoPreview && !profileData.photo_url ? 'bg-gray-100' : ''}`}
                />
                <label
                  htmlFor="photo"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                >
                  <Camera size={16} />
                </label>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="github" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                GitHub
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/assets/icons/github.png"
                    alt="GitHub"
                    className="w-5 h-5 opacity-70"
                  />
                </div>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={profileData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/kullaniciadi"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/assets/icons/linkedin.png"
                    alt="LinkedIn"
                    className="w-5 h-5 opacity-70"
                  />
                </div>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={profileData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/kullaniciadi"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center px-4 py-2 rounded-md text-white ${
              saving ? "bg-gray-400" : "bg-[#404040] hover:bg-[#505050]"
            } transition-colors`}
          >
            <Save size={18} className="mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

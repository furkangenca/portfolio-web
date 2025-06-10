"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ProfileData {
  name: string
  title: string
  bio: string
  photo_url?: string
}

export default function HomePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch profile data
    fetch("http://localhost:5000/api/profile")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Profil bilgileri bulunamadı. Lütfen admin panelinden profil bilgilerinizi ekleyin.');
          }
          throw new Error('Profil bilgileri alınamadı.');
        }
        return res.json();
      })
      .then((data) => setProfileData(data))
      .catch((err) => {
        console.error("Profile data fetch error:", err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#404040] font-montserrat text-xl text-center max-w-md p-4">
          {error}
          <div className="mt-4">
            <a href="/admin/login" className="text-indigo-600 hover:text-indigo-800">
              Admin paneline git →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#404040] font-montserrat text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center space-y-8">
          {/* Profile Photo */}
          <div className="relative w-48 h-48 mx-auto">
            <Image
              src={
                profileData.photo_url
                  ? `http://localhost:5000${profileData.photo_url}`
                  : "/placeholder.svg?height=192&width=192"
              }
              alt={`${profileData.name} - Profil Fotoğrafı`}
              fill
              className="rounded-full object-cover border-4 border-[#404040]"
            />
          </div>

          {/* Name */}
          <h1 className="font-anton text-7xl text-[#404040] uppercase tracking-wider leading-tight">
            {profileData.name}
          </h1>

          {/* Title */}
          <h2 className="font-montserrat text-2xl text-[#404040] uppercase tracking-wide font-medium">
            {profileData.title}
          </h2>

          {/* Bio */}
          <p className="font-montserrat text-black text-lg max-w-md mx-auto leading-relaxed">{profileData.bio}</p>
        </div>
      </div>
    </div>
  );
}

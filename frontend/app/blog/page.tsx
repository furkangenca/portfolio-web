"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface BlogPost {
  id: number
  title: string
  image_url: string | null
  created_at: string
  slug: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:5000/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Blog posts fetch error:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#404040] font-montserrat">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-anton text-6xl text-[#404040] uppercase tracking-wider mb-4">Blog</h1>
          <p className="font-montserrat text-black text-lg">Yazılarım...</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                {post.image_url && (
                  <div className="relative h-48">
                    <Image
                      src={`http://localhost:5000${post.image_url}`}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-anton text-2xl text-[#404040] mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="font-montserrat text-gray-500">
                    {format(new Date(post.created_at), "d MMMM yyyy", { locale: tr })}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

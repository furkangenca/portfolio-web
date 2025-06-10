"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import 'quill/dist/quill.snow.css'

interface BlogPost {
  id: number
  title: string
  content: string
  image_url: string
  created_at: string
  slug: string
}

interface Comment {
  id: number
  name: string
  comment: string
  created_at: string
}

export default function BlogPostPage() {
  const params = useParams()
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    // CSRF token'ı al
    fetch('http://localhost:5000/admin/login', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      })
      .catch((err) => {
        console.error('CSRF token fetch error:', err)
      })

    if (params.id) {
      fetch(`http://localhost:5000/api/blog/slug/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setBlogPost(data)
          return fetch(`http://localhost:5000/api/blog/comments/${data.id}`)
        })
        .then((res) => res.json())
        .then((data) => {
          setComments(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Blog post fetch error:', err)
          setLoading(false)
        })
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:5000/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          blog_id: blogPost?.id,
          ...commentForm,
        }),
      })

      if (response.ok) {
        setSuccess('Yorumunuz başarıyla eklendi.')
        setCommentForm({ name: '', email: '', comment: '' })
        const commentsRes = await fetch(`http://localhost:5000/api/blog/comments/${blogPost?.id}`)
        const commentsData = await commentsRes.json()
        setComments(commentsData)
      } else {
        setError('Yorum eklenirken bir hata oluştu.')
      }
    } catch (err) {
      console.error('Comment submit error:', err)
      setError('Yorum eklenirken bir hata oluştu.')
    } finally {
      setSubmitting(false)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#404040] font-montserrat">Yükleniyor...</div>
      </div>
    )
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#404040] font-montserrat">Blog yazısı bulunamadı.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/blog" 
          className="inline-flex items-center space-x-2 text-white bg-[#404040] py-2 px-4 rounded-full hover:bg-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-montserrat">Blog'a Dön</span>
        </Link>

        <article>
          {blogPost.image_url && (
            <div className="relative h-72 md:h-[500px] mb-8 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={
                  blogPost.image_url
                    ? `http://localhost:5000${blogPost.image_url}`
                    : "/placeholder.svg?height=384&width=768"
                }
                alt={blogPost.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <header className="mb-8">
            <h1 className="font-anton text-5xl md:text-6xl text-[#404040] uppercase tracking-wider mb-4 leading-tight">{blogPost.title}</h1>
            <p className="font-montserrat text-gray-500 text-lg">{formatDate(blogPost.created_at)}</p>
          </header>

          <div className="max-w-none text-black font-montserrat leading-relaxed">
            <div
              className="ql-editor bg-white p-8 rounded-lg shadow-lg"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>
        </article>

        <div className="mt-16">
          <h2 className="font-anton text-3xl text-[#404040] uppercase mb-8">Yorumlar</h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="font-montserrat text-xl font-medium mb-4">Yorum Yap</h3>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                  İsim
                </label>
                <input
                  type="text"
                  id="name"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  required
                />
              </div>

              <div>
                <label htmlFor="comment" className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                  Yorum
                </label>
                <textarea
                  id="comment"
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#404040]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-[#404040] text-white py-2 px-4 rounded-md font-montserrat font-medium hover:bg-gray-700 transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 font-montserrat">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-montserrat font-medium text-[#404040]">{comment.name}</h4>
                    <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="font-montserrat text-gray-700">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/features/admin/admin-layout'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BlogComment {
  id: number
  blog_id: number
  blog_title: string
  name: string
  email: string
  comment: string
  ip_address: string
  created_at: string
}

export default function BlogCommentsPage() {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

    // Yorumları al
    fetch('http://localhost:5000/admin/blog-comments', {
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setComments(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Blog comments fetch error:', err)
        setError('Yorumlar yüklenirken bir hata oluştu.')
        setLoading(false)
      })
  }, [csrfToken])

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/blog-comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      })

      if (response.ok) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      } else {
        setError('Yorum silinemedi.')
      }
    } catch (err) {
      console.error('Comment delete error:', err)
      setError('Yorum silinirken bir hata oluştu.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <h1 className="font-anton text-3xl text-[#404040] uppercase">Blog Yorumları</h1>
        <Link href="/admin/blog" className="text-[#404040] hover:text-gray-600 flex items-center font-montserrat">
          <ArrowLeft size={18} className="mr-2" />
          Blog Yazılarına Dön
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blog Yazısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-posta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Yorum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Adresi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Henüz yorum bulunmuyor.
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {comment.blog_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{comment.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.ip_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(comment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
} 
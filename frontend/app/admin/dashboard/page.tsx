'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  projects: number;
  experiences: number;
  blogPosts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    experiences: 0,
    blogPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Önce CSRF token'ı al
        const csrfResponse = await fetch('http://localhost:5000/admin/login', {
          credentials: 'include'
        });
        
        if (!csrfResponse.ok) {
          throw new Error('CSRF token alınamadı');
        }
        
        const { csrfToken } = await csrfResponse.json();

        // İstatistikleri getir
        const [projectsRes, experiencesRes, blogRes] = await Promise.all([
          fetch('http://localhost:5000/admin/projects', { 
            credentials: 'include',
            headers: {
              'X-CSRF-Token': csrfToken
            }
          }),
          fetch('http://localhost:5000/admin/experiences', { 
            credentials: 'include',
            headers: {
              'X-CSRF-Token': csrfToken
            }
          }),
          fetch('http://localhost:5000/api/blog', { 
            credentials: 'include',
            headers: {
              'X-CSRF-Token': csrfToken
            }
          })
        ]);

        if (!projectsRes.ok || !experiencesRes.ok || !blogRes.ok) {
          throw new Error('İstatistikler alınamadı');
        }

        const [projects, experiences, blogPosts] = await Promise.all([
          projectsRes.json(),
          experiencesRes.json(),
          blogRes.json()
        ]);

        setStats({
          projects: projects.length,
          experiences: experiences.length,
          blogPosts: blogPosts.length
        });
        setLoading(false);
      } catch (error) {
        console.error('Dashboard yüklenirken hata:', error);
        setError('Veriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projeler Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Projeler</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.projects}</p>
          <button
            onClick={() => router.push('/admin/projects')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Projeleri Yönet →
          </button>
        </div>

        {/* Deneyimler Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Deneyimler</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.experiences}</p>
          <button
            onClick={() => router.push('/admin/experiences')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Deneyimleri Yönet →
          </button>
        </div>

        {/* Blog Yazıları Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Blog Yazıları</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.blogPosts}</p>
          <button
            onClick={() => router.push('/admin/blog')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Blog Yazılarını Yönet →
          </button>
        </div>
      </div>

      {/* Hızlı Erişim Menüsü */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/admin/projects/new')}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Yeni Proje Ekle
          </button>
          <button
            onClick={() => router.push('/admin/experiences/new')}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Yeni Deneyim Ekle
          </button>
          <button
            onClick={() => router.push('/admin/blog/new')}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Yeni Blog Yazısı Ekle
          </button>
          <button
            onClick={() => router.push('/admin/profile')}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Profili Düzenle
          </button>
        </div>
      </div>
    </div>
  );
} 
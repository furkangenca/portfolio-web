"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [csrfToken, setCsrfToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      console.log("CSRF token alınıyor...");
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "GET",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error("CSRF token alınamadı:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("CSRF token alındı");
      setCsrfToken(data.csrfToken);
      setLoading(false);
    } catch (error) {
      console.error("CSRF token alınamadı:", error);
      setError("Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log("Giriş yapılıyor...");
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, password })
      });

      console.log("Giriş yanıtı:", response.status);

      if (!response.ok) {
        throw new Error('Giriş başarısız');
      }

      const data = await response.json();
      console.log("Giriş yanıtı:", data);
      
      if (data.message === 'Giriş başarılı!') {
        console.log("Giriş başarılı, dashboard'a yönlendiriliyor...");
        router.push('/admin');
      } else {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Girişi
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Kullanıcı Adı</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

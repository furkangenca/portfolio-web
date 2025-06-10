# Portfolio Web Projesi

Bu proje, kişisel portfolyo web sitesi için geliştirilmiş full-stack bir uygulamadır. Next.js frontend ve Node.js backend kullanılarak oluşturulmuştur.

## 🚀 Özellikler

- Modern ve responsive tasarım
- Blog yönetim sistemi
- Proje portfolyosu
- Deneyim ve yetenekler bölümü
- Admin paneli
- Ziyaretçi takip sistemi

## 🛠️ Teknolojiler

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Query

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- CSRF Protection

## 📦 Kurulum

### Backend Kurulumu

```bash
cd backend
npm install
```

`.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=portfolio_db
JWT_SECRET=your_jwt_secret
```

Veritabanını oluşturun:
```bash
mysql -u root -p < database.sql
```

Backend'i başlatın:
```bash
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
```

`.env.local` dosyasını oluşturun:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Frontend'i başlatın:
```bash
npm run dev
```

## 🔐 Admin Paneli

Admin paneline `/admin` rotası üzerinden erişebilirsiniz. İlk kullanıcı oluşturma işlemi için `generateHash.js` scriptini kullanabilirsiniz.

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

- Furkan Genç - [GitHub](https://github.com/furkangenca) 
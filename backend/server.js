const dotenv = require('dotenv');
// Çevre değişkenlerini yükle
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const db = require('./config/db');
const ipLoggerMiddleware = require('./middleware/ipLoggerMiddleware');
const generalRoutes = require('./routes/generalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const blogRoutes = require('./routes/blogRoutes');

// DEBUG: process.env.DB_USER: undefined
// DEBUG: process.env.DB_PASSWORD: undefined

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true
  }
}));
app.use(csrf({ cookie: true }));
app.use(ipLoggerMiddleware);

// Statik dosyalar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotalar
app.use('/api', generalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/admin', adminRoutes);

// Veritabanı bağlantı testi (bu rotayı sadece test için bırakıyorum)
app.get('/test-db', async (req, res) => {
  try {
    const connection = await db.getConnection();
    connection.release();
    res.json({ message: 'Veritabanı bağlantısı başarılı!' });
  } catch (error) {
    res.status(500).json({ message: 'Veritabanı bağlantı hatası!', error: error.message });
  }
});

// Ana route (health check)
app.get('/', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'CSRF token geçersiz.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Sunucu hatası.' });
});

// Port ayarı
const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 
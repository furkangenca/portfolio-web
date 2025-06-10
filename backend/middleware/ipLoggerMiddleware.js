const db = require('../config/db');

const ipLoggerMiddleware = async (req, res, next) => {
  // Admin paneli, stats endpoint'i, profil endpoint'i ve statik dosyaları hariç tut
  if (
    req.path.startsWith('/_next') || 
    req.path.startsWith('/admin') || 
    req.path === '/api/stats' ||
    req.path === '/api/profile' ||
    req.path.includes('.')
  ) {
    return next();
  }

  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || null;
  const referrer = req.headers['referrer'] || null;

  try {
    // Her ziyareti kaydet
    await db.query(
      'INSERT INTO visitor_logs (ip_address, user_agent, referrer, timestamp) VALUES (?, ?, ?, UTC_TIMESTAMP())',
      [ipAddress, userAgent, referrer]
    );
    
    next();
  } catch (error) {
    console.error('IP adresi loglanırken hata oluştu:', error);
    next(); // Hata olsa bile isteği devam ettir
  }
};

module.exports = ipLoggerMiddleware; 
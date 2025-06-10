const authMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Yetkisiz erişim. Lütfen giriş yapın.' });
  }
};

module.exports = authMiddleware; 
const bcrypt = require('bcrypt');
const db = require('../../config/db');

const authController = {
  // Admin giriş formu (CSRF token içerir)
  getLogin: (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  },

  // Admin girişi yap ve session başlat
  login: async (req, res) => {
    const { username, password } = req.body;
    try {
      const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
      if (rows.length > 0) {
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (passwordMatch) {
          req.session.userId = user.id;
          res.json({ message: 'Giriş başarılı!' });
        } else {
          res.status(401).json({ message: 'Kullanıcı adı veya parola yanlış.' });
        }
      } else {
        res.status(401).json({ message: 'Kullanıcı adı veya parola yanlış.' });
      }
    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Admin oturumunu sonlandır
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Oturum kapatılırken hata oluştu:', err);
        return res.status(500).json({ message: 'Oturum kapatılamadı.' });
      }
      res.json({ message: 'Oturum başarıyla kapatıldı.' });
    });
  }
};

module.exports = authController;
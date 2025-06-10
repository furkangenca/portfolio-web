const db = require('../config/db');

const blogController = {
  // Tüm blog yazılarını getirir
  getAllBlogPosts: async (req, res) => {
    try {
      const [posts] = await db.query('SELECT id, title, image_url, created_at, slug FROM blog_posts ORDER BY created_at DESC');
      res.json(posts);
    } catch (error) {
      console.error('Tüm blog yazıları getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli bir blog yazısının içeriğini getirir (ID ile)
  getBlogPostById: async (req, res) => {
    const { id } = req.params;
    try {
      const [postRows] = await db.query('SELECT id, title, content, image_url, created_at, slug FROM blog_posts WHERE id = ?', [id]);
      if (postRows.length === 0) {
        return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });
      }
      res.json(postRows[0]);
    } catch (error) {
      console.error('Blog yazısı detayı getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli bir blog yazısının içeriğini getirir (Slug ile)
  getBlogPostBySlug: async (req, res) => {
    const { slug } = req.params;
    try {
      const [postRows] = await db.query('SELECT id, title, content, image_url, created_at, slug FROM blog_posts WHERE slug = ?', [slug]);
      if (postRows.length === 0) {
        return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });
      }
      res.json(postRows[0]);
    } catch (error) {
      console.error('Blog yazısı detayı getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Blog yazısına yorum ekler
  addComment: async (req, res) => {
    const { blog_id, name, email, comment } = req.body;
    const ip_address = req.ip;

    try {
      const [result] = await db.query(
        'INSERT INTO blog_comments (blog_id, name, email, comment, ip_address) VALUES (?, ?, ?, ?, ?)',
        [blog_id, name, email, comment, ip_address]
      );
      res.status(201).json({ message: 'Yorum başarıyla eklendi', commentId: result.insertId });
    } catch (error) {
      console.error('Yorum eklenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Blog yazısının yorumlarını getirir (public)
  getComments: async (req, res) => {
    const { blog_id } = req.params;
    try {
      const [comments] = await db.query(
        'SELECT id, name, comment, created_at FROM blog_comments WHERE blog_id = ? ORDER BY created_at DESC',
        [blog_id]
      );
      res.json(comments);
    } catch (error) {
      console.error('Yorumlar getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = blogController; 
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const slugify = require('../../utils/slugify');

const blogController = {
  // Yeni blog yazısı ekler (image + text)
  createBlogPost: async (req, res) => {
    const { title, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const created_at = new Date();
    const slug = slugify(title);

    try {
      const [result] = await db.query(
        'INSERT INTO blog_posts (title, content, image_url, created_at, slug) VALUES (?, ?, ?, ?, ?)',
        [title, content, image_url, created_at, slug]
      );
      res.status(201).json({ message: 'Blog yazısı başarıyla oluşturuldu!', postId: result.insertId });
    } catch (error) {
      console.error('Blog yazısı oluşturulurken hata oluştu:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Yazıyı günceller
  updateBlogPost: async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = slugify(title);

    try {
      const [existingPostRows] = await db.query('SELECT image_url FROM blog_posts WHERE id = ?', [id]);
      if (existingPostRows.length === 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });
      }

      const oldImageUrl = existingPostRows[0].image_url;

      if (!image_url) {
        image_url = oldImageUrl;
      } else if (oldImageUrl && oldImageUrl !== image_url) {
        const oldFilePath = path.join(__dirname, '..', '..', oldImageUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Eski görsel silinirken hata oluştu:', err);
        });
      }

      const [result] = await db.query(
        'UPDATE blog_posts SET title = ?, content = ?, image_url = ?, slug = ? WHERE id = ?',
        [title, content, image_url, slug, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });
      }
      res.json({ message: 'Blog yazısı başarıyla güncellendi!' });
    } catch (error) {
      console.error('Blog yazısı güncellenirken hata oluştu:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Yazıyı siler
  deleteBlogPost: async (req, res) => {
    const { id } = req.params;
    try {
      const [postRows] = await db.query('SELECT image_url FROM blog_posts WHERE id = ?', [id]);
      if (postRows.length === 0) {
        return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });
      }
      const imageUrl = postRows[0].image_url;

      const [result] = await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Blog yazısı silinemedi.' });
      }

      if (imageUrl) {
        const filePath = path.join(__dirname, '..', '..', imageUrl);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Görsel dosyası silinirken hata oluştu:', err);
          }
        });
      }

      res.json({ message: 'Blog yazısı başarıyla silindi!' });
    } catch (error) {
      console.error('Blog yazısı silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Tüm blog yorumlarını getirir (admin)
  getAllComments: async (req, res) => {
    try {
      const [comments] = await db.query(`
        SELECT bc.*, bp.title as blog_title 
        FROM blog_comments bc 
        JOIN blog_posts bp ON bc.blog_id = bp.id 
        ORDER BY bc.created_at DESC
      `);
      res.json(comments);
    } catch (error) {
      console.error('Blog yorumları getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Blog yorumunu siler (admin)
  deleteComment: async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query('DELETE FROM blog_comments WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Yorum bulunamadı.' });
      }
      res.json({ message: 'Yorum başarıyla silindi!' });
    } catch (error) {
      console.error('Blog yorumu silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = blogController;
const db = require('../../config/db');

const experienceController = {
  // Admin paneldeki deneyim listesini getirir
  getExperiences: async (req, res) => {
    try {
      const [experiences] = await db.query('SELECT id, title, description, start_date, end_date, order_index FROM experiences ORDER BY start_date ASC');
      for (let i = 0; i < experiences.length; i++) {
        const [tags] = await db.query('SELECT id, tag_name FROM experience_tags WHERE experience_id = ?', [experiences[i].id]);
        experiences[i].tags = tags;
      }
      res.json(experiences);
    } catch (error) {
      console.error('Admin deneyimleri getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Yeni deneyim oluşturur
  createExperience: async (req, res) => {
    const { title, description, start_date, end_date, order_index } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO experiences (title, description, start_date, end_date, order_index) VALUES (?, ?, ?, ?, ?)',
        [title, description, start_date, end_date, order_index || 0]
      );
      res.status(201).json({ message: 'Deneyim başarıyla oluşturuldu!', experienceId: result.insertId });
    } catch (error) {
      console.error('Deneyim oluşturulurken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Var olan deneyimi günceller
  updateExperience: async (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date, order_index } = req.body;
    try {
      const [result] = await db.query(
        'UPDATE experiences SET title = ?, description = ?, start_date = ?, end_date = ?, order_index = ? WHERE id = ?',
        [title, description, start_date, end_date, order_index || 0, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Deneyim bulunamadı.' });
      }
      res.json({ message: 'Deneyim başarıyla güncellendi!' });
    } catch (error) {
      console.error('Deneyim güncellenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Deneyimi siler
  deleteExperience: async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query('DELETE FROM experiences WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Deneyim bulunamadı.' });
      }
      res.json({ message: 'Deneyim başarıyla silindi!' });
    } catch (error) {
      console.error('Deneyim silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Deneyime etiket ekler
  addTagToExperience: async (req, res) => {
    const { id } = req.params;
    const { tag_name } = req.body;
    try {
      const [experienceRows] = await db.query('SELECT id FROM experiences WHERE id = ?', [id]);
      if (experienceRows.length === 0) {
        return res.status(404).json({ message: 'Deneyim bulunamadı.' });
      }

      const [result] = await db.query(
        'INSERT INTO experience_tags (experience_id, tag_name) VALUES (?, ?)',
        [id, tag_name]
      );
      res.status(201).json({ message: 'Etiket başarıyla eklendi!', tagId: result.insertId });
    } catch (error) {
      console.error('Etiket eklenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Deneyimin etiketlerini günceller
  updateExperienceTags: async (req, res) => {
    const { id } = req.params;
    const { tags } = req.body;

    try {
      const [experienceRows] = await db.query('SELECT id FROM experiences WHERE id = ?', [id]);
      if (experienceRows.length === 0) {
        return res.status(404).json({ message: 'Deneyim bulunamadı.' });
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        await connection.query('DELETE FROM experience_tags WHERE experience_id = ?', [id]);

        if (tags && tags.length > 0) {
          const values = tags.map(tag => [id, tag]);
          await connection.query('INSERT INTO experience_tags (experience_id, tag_name) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ message: 'Deneyim etiketleri başarıyla güncellendi!' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Etiketler güncellenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli etiketi siler
  deleteTagFromExperience: async (req, res) => {
    const { experienceId, tagId } = req.params;
    try {
      const [result] = await db.query('DELETE FROM experience_tags WHERE id = ? AND experience_id = ?', [tagId, experienceId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Etiket bulunamadı veya bu deneyime ait değil.' });
      }
      res.json({ message: 'Etiket başarıyla silindi!' });
    } catch (error) {
      console.error('Etiket silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = experienceController;
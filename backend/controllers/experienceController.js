const db = require('../config/db');

const experienceController = {
  // Tüm deneyimleri getirir, start_date'e göre artarak sıralanmış
  getAllExperiences: async (req, res) => {
    try {
      const [experiences] = await db.query('SELECT id, title, description, start_date, end_date FROM experiences ORDER BY start_date ASC');

      for (let i = 0; i < experiences.length; i++) {
        const [tags] = await db.query('SELECT tag_name FROM experience_tags WHERE experience_id = ?', [experiences[i].id]);
        experiences[i].tags = tags.map(tag => tag.tag_name);
      }

      res.json(experiences);
    } catch (error) {
      console.error('Tüm deneyimler getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli bir deneyimin detaylarını getirir
  getExperienceById: async (req, res) => {
    const { id } = req.params;
    try {
      const [experiences] = await db.query('SELECT id, title, description, start_date, end_date FROM experiences WHERE id = ?', [id]);
      
      if (experiences.length === 0) {
        return res.status(404).json({ message: 'Deneyim bulunamadı.' });
      }

      const experience = experiences[0];
      const [tags] = await db.query('SELECT tag_name FROM experience_tags WHERE experience_id = ?', [id]);
      experience.tags = tags.map(tag => tag.tag_name);

      res.json(experience);
    } catch (error) {
      console.error('Deneyim detayları getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = experienceController; 
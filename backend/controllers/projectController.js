const db = require('../config/db');

const projectController = {
  // Kullanıcıya açık: Tüm projelerin kısa bilgilerini döner (id, title, short_desc)
  getAllProjects: async (req, res) => {
    try {
      const [projects] = await db.query('SELECT id, title, short_desc FROM projects');
      res.json(projects);
    } catch (error) {
      console.error('Tüm projeler getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Kullanıcıya açık: Belirli projenin detaylarını döner
  getProjectById: async (req, res) => {
    const { id } = req.params;
    try {
      const [projectRows] = await db.query('SELECT id, title, short_desc, long_desc, github_url FROM projects WHERE id = ?', [id]);

      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }

      const project = projectRows[0];

      // Projeye bağlı teknolojileri getir
      const [techRows] = await db.query('SELECT id, tech_name FROM project_technologies WHERE project_id = ?', [id]);
      project.technologies = techRows.map(tech => tech.tech_name);

      // Projeye bağlı görselleri getir
      const [imageRows] = await db.query('SELECT id, image_url FROM project_images WHERE project_id = ?', [id]);
      project.images = imageRows.map(image => image.image_url);
      project.imageIds = imageRows.map(image => image.id);

      res.json(project);
    } catch (error) {
      console.error('Proje detayı getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = projectController; 
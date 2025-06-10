const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const projectController = {
  // Admin paneldeki proje listesini getirir
  getProjects: async (req, res) => {
    try {
      const [projects] = await db.query('SELECT * FROM projects');
      res.json(projects);
    } catch (error) {
      console.error('Admin projeleri getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Yeni proje oluşturur
  createProject: async (req, res) => {
    const { title, short_desc, long_desc, github_url } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO projects (title, short_desc, long_desc, github_url) VALUES (?, ?, ?, ?)',
        [title, short_desc, long_desc, github_url]
      );
      res.status(201).json({ message: 'Proje başarıyla oluşturuldu!', projectId: result.insertId });
    } catch (error) {
      console.error('Proje oluşturulurken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Var olan projeyi günceller
  updateProject: async (req, res) => {
    const { id } = req.params;
    const { title, short_desc, long_desc, github_url } = req.body;
    try {
      const [result] = await db.query(
        'UPDATE projects SET title = ?, short_desc = ?, long_desc = ?, github_url = ? WHERE id = ?',
        [title, short_desc, long_desc, github_url, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }
      res.json({ message: 'Proje başarıyla güncellendi!' });
    } catch (error) {
      console.error('Proje güncellenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Projeyi siler
  deleteProject: async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }
      res.json({ message: 'Proje başarıyla silindi!' });
    } catch (error) {
      console.error('Proje silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Projeye teknoloji tag'ı ekler
  addTechnologyToProject: async (req, res) => {
    const { id } = req.params;
    const { tech_name } = req.body;
    try {
      const [projectRows] = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }

      const [result] = await db.query(
        'INSERT INTO project_technologies (project_id, tech_name) VALUES (?, ?)',
        [id, tech_name]
      );
      res.status(201).json({ message: 'Teknoloji başarıyla eklendi!', techId: result.insertId });
    } catch (error) {
      console.error('Teknoloji eklenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Projenin teknolojilerini günceller
  updateProjectTechnologies: async (req, res) => {
    const { id } = req.params;
    const { technologies } = req.body;

    try {
      const [projectRows] = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
      if (projectRows.length === 0) {
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        await connection.query('DELETE FROM project_technologies WHERE project_id = ?', [id]);

        if (technologies && technologies.length > 0) {
          const values = technologies.map(tech => [id, tech]);
          await connection.query('INSERT INTO project_technologies (project_id, tech_name) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ message: 'Proje teknolojileri başarıyla güncellendi!' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Teknolojiler güncellenirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli teknolojiyi siler
  deleteTechnologyFromProject: async (req, res) => {
    const { projectId, techId } = req.params;
    try {
      const [result] = await db.query('DELETE FROM project_technologies WHERE id = ? AND project_id = ?', [techId, projectId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Teknoloji bulunamadı veya bu projeye ait değil.' });
      }
      res.json({ message: 'Teknoloji başarıyla silindi!' });
    } catch (error) {
      console.error('Teknoloji silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Çoklu görsel yükleme
  uploadProjectImages: async (req, res) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosya yüklenmedi.' });
    }

    try {
      const [projectRows] = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
      if (projectRows.length === 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
        return res.status(404).json({ message: 'Proje bulunamadı.' });
      }

      const imageInserts = req.files.map(file => [
        id,
        `/uploads/${file.filename}`
      ]);

      if (imageInserts.length > 0) {
        await db.query('INSERT INTO project_images (project_id, image_url) VALUES ?', [imageInserts]);
      }

      res.status(201).json({ 
        message: 'Görseller başarıyla yüklendi!', 
        files: req.files.map(file => ({ 
          filename: file.filename, 
          url: `/uploads/${file.filename}` 
        })) 
      });
    } catch (error) {
      console.error('Görsel yüklenirken hata oluştu:', error);
      if (req.files) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Belirli görseli siler
  deleteProjectImage: async (req, res) => {
    const { projectId, imageId } = req.params;
    try {
      const [imageRows] = await db.query('SELECT image_url FROM project_images WHERE id = ? AND project_id = ?', [imageId, projectId]);
      if (imageRows.length === 0) {
        return res.status(404).json({ message: 'Görsel bulunamadı veya bu projeye ait değil.' });
      }

      const imageUrl = imageRows[0].image_url;
      const filePath = path.join(__dirname, '..', '..', imageUrl);

      const [result] = await db.query('DELETE FROM project_images WHERE id = ? AND project_id = ?', [imageId, projectId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Görsel silinemedi.' });
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Dosya silinirken hata oluştu:', err);
        }
        res.json({ message: 'Görsel başarıyla silindi!' });
      });
    } catch (error) {
      console.error('Görsel silinirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = projectController;
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const profileController = {
  // Profil bilgilerini getir
  getProfile: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM profile_info LIMIT 1');
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        // Profil bilgileri yoksa boş bir profil objesi döndür
        res.json({
          id: null,
          name: '',
          title: '',
          bio: '',
          photo_url: '',
          email: '',
          linkedin: '',
          github: ''
        });
      }
    } catch (error) {
      console.error('Profil bilgileri getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Profil bilgilerini güncelle
  updateProfile: async (req, res) => {
    try {
      const { name, title, bio, email, github, linkedin } = req.body;
      
      // Eğer fotoğraf yüklendiyse
      let finalPhotoUrl = null;
      if (req.file) {
        finalPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const [existingRows] = await db.query('SELECT id, photo_url FROM profile_info LIMIT 1');
      
      if (existingRows.length > 0) {
        // Eski fotoğrafı sil (eğer varsa ve yeni fotoğraf yüklendiyse)
        if (existingRows[0].photo_url && req.file) {
          const oldFilePath = path.join(__dirname, '..', '..', existingRows[0].photo_url);
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error('Eski fotoğraf silinirken hata oluştu:', err);
          }
        }

        // Eğer yeni fotoğraf yüklendiyse veya mevcut fotoğraf varsa, photo_url'i güncelle
        const photoUrlToUse = finalPhotoUrl || existingRows[0].photo_url;

        await db.query(
          'UPDATE profile_info SET name = ?, title = ?, bio = ?, photo_url = ?, email = ?, github = ?, linkedin = ? WHERE id = ?',
          [name, title, bio, photoUrlToUse, email, github, linkedin, existingRows[0].id]
        );
        
        res.json({ message: 'Profil bilgileri başarıyla güncellendi!' });
      } else {
        await db.query(
          'INSERT INTO profile_info (name, title, bio, photo_url, email, github, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, title, bio, finalPhotoUrl, email, github, linkedin]
        );
        
        res.status(201).json({ message: 'Profil bilgileri başarıyla eklendi!' });
      }
    } catch (error) {
      console.error('Profil bilgileri güncellenirken hata oluştu:', error);
      // Hata durumunda yüklenen dosyayı sil
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Yüklenen dosya silinirken hata oluştu:', err);
        }
      }
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = profileController;
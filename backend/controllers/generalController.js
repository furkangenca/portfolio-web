const db = require('../config/db');

const generalController = {
  // Ana sayfa için tüm bilgileri getirir
  getProfile: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM profile_info LIMIT 1');
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: 'Profil bilgileri bulunamadı.' });
      }
    } catch (error) {
      console.error('Profil bilgileri getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Ziyaretçi sayısı + online kullanıcı sayısını getirir
  getStats: async (req, res) => {
    try {
      // 30 günden eski kayıtları temizle
      await db.query('DELETE FROM visitor_logs WHERE timestamp < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)');

      // Benzersiz IP adreslerinin sayısını al
      const [visitorCount] = await db.query('SELECT COUNT(DISTINCT ip_address) as totalVisitors FROM visitor_logs');
      
      // Son 1 dakika içinde görülen benzersiz IP'lerin sayısını al
      const [onlineUsers] = await db.query(`
        SELECT COUNT(*) as onlineCount 
        FROM (
          SELECT ip_address, MAX(timestamp) as last_seen
          FROM visitor_logs
          GROUP BY ip_address
          HAVING last_seen > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE)
        ) as recent_visitors
      `);
      
      res.json({
        totalVisitors: visitorCount[0].totalVisitors,
        onlineUsers: onlineUsers[0].onlineCount
      });
    } catch (error) {
      console.error('İstatistikler getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  },

  // Ziyaretçi listesini getirir
  getVisitors: async (req, res) => {
    try {
      const [visitors] = await db.query(`
        SELECT 
          ip_address,
          timestamp,
          DATE_FORMAT(CONVERT_TZ(timestamp, 'UTC', '+03:00'), '%d.%m.%Y %H:%i') as formatted_date,
          user_agent,
          referrer
        FROM visitor_logs 
        ORDER BY timestamp DESC 
        LIMIT 100
      `);
      
      res.json(visitors);
    } catch (error) {
      console.error('Ziyaretçi listesi getirilirken hata oluştu:', error);
      res.status(500).json({ message: 'Sunucu hatası.' });
    }
  }
};

module.exports = generalController; 
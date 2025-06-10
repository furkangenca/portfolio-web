-- Admin Kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Profil Bilgileri tablosu
CREATE TABLE IF NOT EXISTS profile_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    title VARCHAR(100),
    bio TEXT,
    photo_url TEXT,
    email TEXT,
    linkedin TEXT,
    github TEXT
);

-- Ziyaretçi Kayıtları tablosu
CREATE TABLE IF NOT EXISTS visitor_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projeler tablosu
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    short_desc VARCHAR(255),
    long_desc TEXT,
    github_url TEXT
);

-- Proje Teknolojileri tablosu
CREATE TABLE IF NOT EXISTS project_technologies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    tech_name VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Proje Görselleri tablosu
CREATE TABLE IF NOT EXISTS project_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    image_url TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Deneyimler tablosu
CREATE TABLE IF NOT EXISTS experiences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    order_index INT DEFAULT 0
);

-- Deneyim Etiketleri tablosu
CREATE TABLE IF NOT EXISTS experience_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experience_id INT,
    tag_name VARCHAR(100),
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
);

-- Blog Yazıları tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME
); 
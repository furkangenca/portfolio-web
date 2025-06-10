function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Boşlukları tire ile değiştir
    .replace(/[^\w\-]+/g, '')    // Alfanumerik olmayan karakterleri kaldır
    .replace(/\-\-+/g, '-')      // Birden fazla tireyi tek tireye dönüştür
    .replace(/^-+/, '')          // Baştaki tireleri kaldır
    .replace(/-+$/, '');         // Sondaki tireleri kaldır
}

module.exports = slugify; 
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Lire le SVG
const svgContent = fs.readFileSync(path.join(__dirname, '../public/trading-icon.svg'), 'utf8');

// Convertir SVG en PNG 32x32
sharp(Buffer.from(svgContent))
  .resize(32, 32)
  .png()
  .toFile(path.join(__dirname, '../public/favicon-32x32.png'))
  .then(() => {
    console.log('✅ Favicon 32x32 créé');
    
    // Créer aussi une version 16x16
    return sharp(Buffer.from(svgContent))
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
  })
  .then(() => {
    console.log('✅ Favicon 16x16 créé');
    
    // Créer un favicon.ico simple en copiant le 32x32
    return sharp(path.join(__dirname, '../public/favicon-32x32.png'))
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.ico'));
  })
  .then(() => {
    console.log('✅ Favicon.ico créé');
    console.log('🎉 Tous les favicons ont été générés avec succès !');
  })
  .catch(err => {
    console.error('❌ Erreur lors de la création des favicons:', err);
  });

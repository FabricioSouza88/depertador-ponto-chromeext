/**
 * Script Node.js para gerar ícones PNG a partir do SVG
 * 
 * Uso:
 * 1. Instale as dependências: npm install sharp
 * 2. Execute: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Verifica se sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp não está instalado.');
  console.log('📦 Instale com: npm install sharp');
  process.exit(1);
}

const svgPath = path.join(__dirname, 'icon.svg');
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  console.log('🎨 Gerando ícones PNG...\n');

  for (const size of sizes) {
    const outputPath = path.join(__dirname, `icon${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Gerado: icon${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao gerar icon${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Ícones gerados com sucesso!');
}

// Verifica se o arquivo SVG existe
if (!fs.existsSync(svgPath)) {
  console.error('❌ Arquivo icon.svg não encontrado!');
  process.exit(1);
}

generateIcons().catch(console.error);

# Ícones da Extensão

Este diretório contém os ícones da extensão em formato SVG.

## Gerando PNGs

Para gerar os ícones PNG necessários (16x16, 32x32, 48x48, 128x128), você pode:

### Opção 1: Usando ferramentas online
- Acesse: https://cloudconvert.com/svg-to-png
- Faça upload do `icon.svg`
- Converta para os tamanhos necessários

### Opção 2: Usando ImageMagick (linha de comando)
```bash
# Instale ImageMagick primeiro
# Windows: https://imagemagick.org/script/download.php

convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Opção 3: Usando Node.js (sharp)
```bash
npm install sharp sharp-cli -g
sharp -i icon.svg -o icon16.png resize 16 16
sharp -i icon.svg -o icon32.png resize 32 32
sharp -i icon.svg -o icon48.png resize 48 48
sharp -i icon.svg -o icon128.png resize 128 128
```

### Opção 4: Usando Inkscape
```bash
inkscape icon.svg -w 16 -h 16 -o icon16.png
inkscape icon.svg -w 32 -h 32 -o icon32.png
inkscape icon.svg -w 48 -h 48 -o icon48.png
inkscape icon.svg -w 128 -h 128 -o icon128.png
```

## Ícones Temporários

Se você quiser testar a extensão imediatamente sem gerar os PNGs, você pode usar ícones de placeholder temporários. O Chrome aceitará a extensão sem ícones, mas mostrará um ícone padrão.

#!/usr/bin/env python3
"""
Script Python para gerar ícones PNG placeholder
Requer: pip install Pillow

Uso: python generate-icons.py
"""

try:
    from PIL import Image, ImageDraw
    import os
except ImportError:
    print("[ERRO] Pillow nao esta instalado.")
    print("Instale com: pip install Pillow")
    exit(1)

# Configurações
SIZES = [16, 32, 48, 128]
ICON_COLOR = (102, 126, 234)  # Roxo
WHITE = (255, 255, 255)
RED = (231, 76, 60)

def generate_icon(size):
    """Gera um ícone de relógio/alarme"""
    # Cria imagem com transparência
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Círculo de fundo (roxo)
    margin = 2
    draw.ellipse([margin, margin, size-margin, size-margin], fill=ICON_COLOR)
    
    # Relógio (círculo branco)
    clock_size = int(size * 0.6)
    clock_x = (size - clock_size) // 2
    clock_y = (size - clock_size) // 2
    draw.ellipse([clock_x, clock_y, clock_x + clock_size, clock_y + clock_size], fill=WHITE)
    
    # Ponteiros do relógio
    center_x = size // 2
    center_y = size // 2
    line_width = max(1, size // 16)
    
    # Ponteiro das horas (para cima)
    hour_length = clock_size // 3
    draw.line([(center_x, center_y), (center_x, center_y - hour_length)], 
              fill=ICON_COLOR, width=line_width)
    
    # Ponteiro dos minutos (para direita)
    minute_length = clock_size // 2
    draw.line([(center_x, center_y), (center_x + minute_length, center_y)], 
              fill=ICON_COLOR, width=line_width)
    
    # Badge de notificação (apenas em ícones maiores)
    if size >= 32:
        badge_size = size // 4
        badge_x = size - badge_size - 4
        badge_y = 4
        draw.ellipse([badge_x, badge_y, badge_x + badge_size, badge_y + badge_size], fill=RED)
    
    return img

def main():
    print("Gerando icones PNG placeholder...\n")
    
    # Obtém o diretório do script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for size in SIZES:
        try:
            img = generate_icon(size)
            output_path = os.path.join(script_dir, f'icon{size}.png')
            img.save(output_path, 'PNG')
            print(f"[OK] Gerado: icon{size}.png")
        except Exception as e:
            print(f"[ERRO] Erro ao gerar icon{size}.png: {e}")
    
    print("\nIcones gerados com sucesso!")
    print("\nNota: Estes sao icones placeholder basicos.")
    print("   Para icones de alta qualidade, use: npm run generate-icons")

if __name__ == '__main__':
    main()

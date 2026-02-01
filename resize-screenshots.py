#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Redimensionamento de Screenshots
Redimensiona imagens para os padrões da Chrome Web Store

Requisitos Chrome Web Store:
- Tamanho recomendado: 1280x800 pixels (proporção 16:10)
- Tamanho alternativo: 640x400 pixels (proporção 16:10)
- Formato: PNG ou JPEG
"""

import os
from pathlib import Path
from PIL import Image

# Configurações
SOURCE_DIR = "screenshots"
OUTPUT_DIR = "screenshots/resized"
TARGET_WIDTH = 1280
TARGET_HEIGHT = 800
TARGET_RATIO = 16 / 10
QUALITY = 95  # Qualidade JPEG (1-100)

# Cores para output no terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    """Imprime cabeçalho colorido"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_info(text):
    """Imprime informação"""
    print(f"{Colors.OKBLUE}{text}{Colors.ENDC}")


def print_success(text):
    """Imprime sucesso"""
    print(f"{Colors.OKGREEN}[OK] {text}{Colors.ENDC}")


def print_warning(text):
    """Imprime aviso"""
    print(f"{Colors.WARNING}[AVISO] {text}{Colors.ENDC}")


def print_error(text):
    """Imprime erro"""
    print(f"{Colors.FAIL}[ERRO] {text}{Colors.ENDC}")


def resize_image(image_path, output_path):
    """
    Redimensiona uma imagem para os padrões da Chrome Web Store
    
    Args:
        image_path: Caminho da imagem original
        output_path: Caminho para salvar a imagem redimensionada
    
    Returns:
        dict: Informações sobre o redimensionamento
    """
    try:
        # Abrir imagem
        img = Image.open(image_path)
        original_size = img.size
        original_ratio = img.width / img.height
        
        print_info(f"   Processando: {image_path.name}")
        print_info(f"   Tamanho original: {img.width}x{img.height} px")
        print_info(f"   Proporção original: {original_ratio:.2f}:1")
        
        # Calcular novo tamanho mantendo proporção
        if original_ratio > TARGET_RATIO:
            # Imagem mais larga - ajustar pela largura
            new_width = TARGET_WIDTH
            new_height = int(TARGET_WIDTH / original_ratio)
        else:
            # Imagem mais alta - ajustar pela altura
            new_height = TARGET_HEIGHT
            new_width = int(TARGET_HEIGHT * original_ratio)
        
        # Redimensionar com alta qualidade (LANCZOS)
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Criar canvas 1280x800 com fundo branco
        canvas = Image.new('RGB', (TARGET_WIDTH, TARGET_HEIGHT), (255, 255, 255))
        
        # Centralizar imagem redimensionada no canvas
        offset_x = (TARGET_WIDTH - new_width) // 2
        offset_y = (TARGET_HEIGHT - new_height) // 2
        
        # Se a imagem original tinha transparência, converter para RGB
        if resized_img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', resized_img.size, (255, 255, 255))
            if resized_img.mode == 'P':
                resized_img = resized_img.convert('RGBA')
            background.paste(resized_img, mask=resized_img.split()[-1] if resized_img.mode == 'RGBA' else None)
            resized_img = background
        elif resized_img.mode != 'RGB':
            resized_img = resized_img.convert('RGB')
        
        canvas.paste(resized_img, (offset_x, offset_y))
        
        # Salvar imagem
        output_format = 'PNG' if output_path.suffix.lower() == '.png' else 'JPEG'
        if output_format == 'JPEG':
            canvas.save(output_path, format=output_format, quality=QUALITY, optimize=True)
        else:
            canvas.save(output_path, format=output_format, optimize=True)
        
        # Calcular tamanhos de arquivo
        original_size_kb = os.path.getsize(image_path) / 1024
        new_size_kb = os.path.getsize(output_path) / 1024
        
        print_info(f"   Tamanho final: {TARGET_WIDTH}x{TARGET_HEIGHT} px")
        print_info(f"   Arquivo: {original_size_kb:.1f} KB -> {new_size_kb:.1f} KB")
        print_success(f"   Salvo em: {output_path.name}\n")
        
        return {
            'success': True,
            'original_size': original_size,
            'new_size': (TARGET_WIDTH, TARGET_HEIGHT),
            'original_file_size': original_size_kb,
            'new_file_size': new_size_kb
        }
        
    except Exception as e:
        print_error(f"   Erro ao processar {image_path.name}: {str(e)}\n")
        return {
            'success': False,
            'error': str(e)
        }


def main():
    """Função principal"""
    print_header("REDIMENSIONADOR DE SCREENSHOTS")
    print_info("Chrome Web Store - Padrão 1280x800 pixels\n")
    
    # Verificar se a pasta source existe
    source_path = Path(SOURCE_DIR)
    if not source_path.exists():
        print_error(f"Pasta '{SOURCE_DIR}' não encontrada!")
        return
    
    # Criar pasta de saída
    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)
    print_success(f"Pasta de saída criada: {OUTPUT_DIR}\n")
    
    # Buscar todas as imagens
    image_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
    images = [f for f in source_path.iterdir() 
              if f.is_file() and f.suffix.lower() in image_extensions]
    
    if not images:
        print_warning("Nenhuma imagem encontrada na pasta 'screenshots'!")
        return
    
    print_info(f"Encontradas {len(images)} imagem(ns) para processar:\n")
    
    # Processar cada imagem
    results = []
    for i, image_path in enumerate(images, 1):
        print_info(f"[{i}/{len(images)}]")
        
        # Definir nome de saída (manter extensão original ou converter para PNG)
        output_name = f"{image_path.stem}_1280x800{image_path.suffix}"
        output_file = output_path / output_name
        
        # Redimensionar
        result = resize_image(image_path, output_file)
        results.append(result)
    
    # Resumo final
    print_header("RESUMO")
    
    successful = sum(1 for r in results if r.get('success', False))
    failed = len(results) - successful
    
    print_info(f"Total processadas: {len(results)}")
    print_success(f"Sucesso: {successful}")
    if failed > 0:
        print_error(f"Falhas: {failed}")
    
    if successful > 0:
        total_original = sum(r.get('original_file_size', 0) for r in results if r.get('success'))
        total_new = sum(r.get('new_file_size', 0) for r in results if r.get('success'))
        
        print_info(f"\nTamanho total original: {total_original:.1f} KB")
        print_info(f"Tamanho total final: {total_new:.1f} KB")
        
        if total_original > total_new:
            savings = ((total_original - total_new) / total_original) * 100
            print_success(f"Economia de espaço: {savings:.1f}%")
        elif total_new > total_original:
            increase = ((total_new - total_original) / total_original) * 100
            print_warning(f"Aumento de espaço: {increase:.1f}%")
    
    print_info(f"\nImagens salvas em: {output_path.absolute()}")
    print_info(f"\n{'='*60}\n")
    print_success("Processo concluido!\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\nProcesso cancelado pelo usuário.")
    except Exception as e:
        print_error(f"\n\nErro inesperado: {str(e)}")

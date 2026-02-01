# 📸 Guia de Screenshots para Chrome Web Store

Este guia explica como preparar screenshots de qualidade para a publicação na Chrome Web Store.

## 📋 Requisitos da Chrome Web Store

### Tamanhos Aceitos

- **Tamanho recomendado**: 1280x800 pixels (proporção 16:10)
- **Tamanho alternativo**: 640x400 pixels (proporção 16:10)
- **Formato**: PNG ou JPEG
- **Quantidade**: Mínimo 1, máximo 5 screenshots

### Boas Práticas

✅ **Faça**:
- Use 1280x800 para melhor qualidade
- Capture tela inteira do popup
- Inclua exemplos de uso real
- Mostre diferentes funcionalidades
- Use dados realistas (horários, entradas)
- Capture em boa resolução
- Mostre a extensão em ação

❌ **Não faça**:
- Não use dados falsos/mock óbvios
- Não inclua informações pessoais sensíveis
- Não use screenshots borrados ou de baixa qualidade
- Não coloque texto demais sobre a imagem
- Não use backgrounds muito poluídos

## 🎯 Screenshots Recomendados

### Screenshot 1: Popup Principal com Entradas
**Objetivo**: Mostrar a interface principal

**Conteúdo**:
- Data de hoje visível
- 2-3 entradas registradas
- Horário de saída calculado
- Barra de progresso em ~60-70%
- Tempo restante visível

**Como capturar**:
1. Abra a extensão
2. Adicione algumas entradas de teste
3. Clique no ícone da extensão
4. Pressione `Win + Shift + S` (Windows) ou `Cmd + Shift + 4` (Mac)
5. Capture a área do popup

### Screenshot 2: Configuração do Botão
**Objetivo**: Mostrar a facilidade de configuração

**Conteúdo**:
- Seção "Botão de Ponto" em destaque
- Status "Configurado" ou botão "Selecionar"
- Informação do selector (se configurado)

**Capturar**: Mesmo processo do screenshot 1

### Screenshot 3: Configurações
**Objetivo**: Mostrar personalização

**Conteúdo**:
- Inputs de horas de trabalho
- Input de intervalo
- Seletor de idioma
- Botão "Salvar" visível

**Capturar**: Scroll até a seção de configurações e capture

### Screenshot 4: Notificação (Opcional)
**Objetivo**: Mostrar os alertas em ação

**Conteúdo**:
- Notificação do Windows/Mac aparecendo
- Mensagem "5 minutos para bater o ponto" ou similar

**Como capturar**:
1. Configure entrada para disparar notificação em breve
2. Aguarde notificação aparecer
3. Capture a tela com a notificação visível
4. `Win + Shift + S` ou `Cmd + Shift + 4`

### Screenshot 5: Multilíngue (Opcional)
**Objetivo**: Mostrar suporte a idiomas

**Conteúdo**:
- Interface em inglês ou espanhol
- Mesmo layout do screenshot 1

**Como capturar**:
1. Mude idioma nas configurações
2. Capture popup principal novamente

## 🐍 Script de Redimensionamento

### Instalação

```bash
# Instalar dependências
pip install -r requirements.txt
```

Ou instalar apenas o Pillow:

```bash
pip install Pillow
```

### Uso

1. **Coloque seus screenshots** na pasta `/screenshots`

2. **Execute o script**:

```bash
python resize-screenshots.py
```

3. **Imagens redimensionadas** estarão em `/screenshots/resized`

### O Que o Script Faz

- ✅ Lê todas as imagens de `/screenshots`
- ✅ Redimensiona para 1280x800 mantendo proporção
- ✅ Centraliza em canvas branco se necessário
- ✅ Otimiza qualidade e tamanho
- ✅ Converte transparência para fundo branco
- ✅ Salva em `/screenshots/resized`
- ✅ Mostra estatísticas de processamento

### Exemplo de Saída

```
============================================================
       REDIMENSIONADOR DE SCREENSHOTS
============================================================

Chrome Web Store - Padrão 1280x800 pixels

✓ Pasta de saída criada: screenshots/resized

Encontradas 3 imagem(ns) para processar:

[1/3]
   Processando: screenshot01.png
   Tamanho original: 1920x1080 px
   Proporção original: 1.78:1
   Tamanho final: 1280x800 px
   Arquivo: 245.3 KB → 156.2 KB
✓  Salvo em: screenshot01_1280x800.png

[2/3]
   Processando: screenshot02.png
   Tamanho original: 1366x768 px
   Proporção original: 1.78:1
   Tamanho final: 1280x800 px
   Arquivo: 198.7 KB → 142.8 KB
✓  Salvo em: screenshot02_1280x800.png

============================================================
                    RESUMO
============================================================

Total processadas: 2
Sucesso: 2

Tamanho total original: 444.0 KB
Tamanho total final: 299.0 KB
Economia de espaço: 32.7%

📁 Imagens salvas em: C:\...\screenshots\resized

✓ Processo concluído! ✨
```

## 🎨 Dicas para Screenshots de Qualidade

### 1. Iluminação e Contraste
- Use modo claro ou escuro consistente
- Evite screenshots com muito brilho
- Mantenha bom contraste entre texto e fundo

### 2. Conteúdo
- Use dados realistas mas não reais (não exponha informações)
- Mostre a extensão "em uso" não "vazia"
- Inclua horários variados mas plausíveis
- Exemplo bom: "08:00", "12:30", "17:00"
- Exemplo ruim: "00:00", "99:99", "teste"

### 3. Composição
- Centre o popup no screenshot
- Deixe um pouco de espaço em volta
- Capture em resolução nativa (não zoom)
- Evite elementos desnecessários no fundo

### 4. Qualidade Técnica
- Use PNG para melhor qualidade
- Não comprima demais (max 80% quality)
- Evite artefatos de compressão
- Teste em diferentes telas antes de enviar

## 📏 Dimensões Exatas

```
Formato      | Largura | Altura | Proporção
-------------|---------|--------|----------
Recomendado  | 1280px  | 800px  | 16:10
Alternativo  | 640px   | 400px  | 16:10
```

## 🔧 Ferramentas Úteis

### Captura de Tela

**Windows**:
- `Win + Shift + S` - Snipping Tool
- `Win + PrtScn` - Captura tela inteira
- Ferramenta de Captura nativa

**Mac**:
- `Cmd + Shift + 4` - Seleção de área
- `Cmd + Shift + 3` - Tela inteira
- Preview app para edição

**Linux**:
- `gnome-screenshot -a` - Área selecionada
- `Shift + PrtScn` - Área selecionada
- Flameshot, Shutter

### Edição de Imagens

- **GIMP** (gratuito, multiplataforma)
- **Paint.NET** (Windows, gratuito)
- **Photoshop** (pago, profissional)
- **Figma** (online, gratuito)
- **Canva** (online, parcialmente gratuito)

### Otimização

- **TinyPNG** (https://tinypng.com/) - Comprimir PNG
- **JPEGmini** (https://www.jpegmini.com/) - Comprimir JPEG
- **Squoosh** (https://squoosh.app/) - Otimizador web do Google

## 📤 Envio para Chrome Web Store

### No Developer Dashboard

1. Vá em **Store Listing** tab
2. Role até **Screenshots**
3. Clique em **"Add screenshot"**
4. Selecione as imagens de `/screenshots/resized`
5. Arraste para ordenar (primeira é a principal)
6. Clique em **"Save draft"**

### Ordem Recomendada

1. **Popup principal** (mostra visão geral)
2. **Configuração** (mostra facilidade de uso)
3. **Entradas registradas** (prova funcionalidade)
4. **Notificação** (destaca alertas)
5. **Multilíngue** (diferencial)

## ✅ Checklist Final

Antes de enviar:

- [ ] Mínimo 1, ideal 3-5 screenshots
- [ ] Todas em 1280x800 pixels
- [ ] Formato PNG ou JPEG
- [ ] Menos de 5 MB cada
- [ ] Sem informações pessoais sensíveis
- [ ] Dados realistas e plausíveis
- [ ] Boa qualidade visual
- [ ] Mostra funcionalidades principais
- [ ] Ordenadas logicamente
- [ ] Testadas em diferentes telas

## 🐛 Problemas Comuns

### "Screenshot rejected: wrong size"
**Solução**: Use o script para redimensionar para 1280x800

### "Screenshot rejected: low quality"
**Solução**: Capture em resolução nativa, não redimensione manualmente

### "Screenshot rejected: contains personal info"
**Solução**: Use dados fictícios mas realistas

### "Screenshot too large"
**Solução**: Comprima usando TinyPNG ou o script

## 🎯 Exemplos de Bons Screenshots

Veja exemplos de extensões populares:

- **Grammarly**: Mostra interface + antes/depois
- **LastPass**: Demonstra uso em contexto real
- **Honey**: Destaca economia e benefícios
- **ColorZilla**: Mostra ferramenta em ação

**Acesse**: https://chrome.google.com/webstore/ e busque extensões similares

---

**Pronto para criar screenshots incríveis!** 📸✨

Para mais informações sobre publicação, consulte: [Guia de Build](BUILD_GUIDE.md)

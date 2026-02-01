# 📸 Screenshots

Esta pasta contém os screenshots da extensão para uso na Chrome Web Store.

## 📁 Estrutura

```
screenshots/
├── screenshot01.png          # Screenshots originais
├── screenshot02.png
├── screenshot03.png
├── screenshot04.png
├── screenshot05.png
└── resized/                  # Screenshots redimensionados (prontos para upload)
    ├── screenshot01_1280x800.png
    ├── screenshot02_1280x800.png
    ├── screenshot03_1280x800.png
    ├── screenshot04_1280x800.png
    └── screenshot05_1280x800.png
```

## ✅ Screenshots Prontos para Upload

Os arquivos em `/resized` estão prontos para fazer upload na Chrome Web Store!

- ✅ Tamanho: 1280x800 pixels (padrão recomendado)
- ✅ Formato: PNG otimizado
- ✅ Total: 5 screenshots

## 📤 Como Usar

### Fazer Upload na Chrome Web Store

1. Acesse: https://chrome.google.com/webstore/devconsole
2. Selecione sua extensão (ou crie nova)
3. Vá na aba **"Store Listing"**
4. Role até a seção **"Screenshots"**
5. Clique em **"Add screenshot"**
6. Selecione os arquivos de `/resized`
7. Arraste para ordenar (primeira é a principal)
8. Clique em **"Save draft"**

## 🔄 Redimensionar Novos Screenshots

Se você adicionar novos screenshots ou quiser redimensionar novamente:

```bash
# Da raiz do projeto, execute:
python resize-screenshots.py
```

O script irá:
- Ler todos os arquivos de `screenshots/`
- Redimensionar para 1280x800
- Salvar em `screenshots/resized/`

## 📊 Estatísticas Atuais

- **Total de screenshots**: 5
- **Tamanho original**: ~447 KB
- **Tamanho final**: ~1,272 KB
- **Formato**: PNG

## 📝 Descrição dos Screenshots

Sugira adicionar descrições para cada screenshot:

1. **screenshot01** - [Descreva o que mostra]
2. **screenshot02** - [Descreva o que mostra]
3. **screenshot03** - [Descreva o que mostra]
4. **screenshot04** - [Descreva o que mostra]
5. **screenshot05** - [Descreva o que mostra]

## 📚 Documentação

Para mais informações sobre screenshots:
- [Guia Completo de Screenshots](../docs/SCREENSHOTS_GUIDE.md)
- [Textos para Chrome Web Store](../docs/CHROME_STORE_LISTING.md)

---

**Prontos para publicação!** 🚀

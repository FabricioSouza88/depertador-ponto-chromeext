# 📦 Como Gerar o ZIP para Publicação

## 🚀 Método Rápido

Execute o script PowerShell na raiz do projeto:

```powershell
.\build-extension.ps1
```

O arquivo `despertador-ponto.zip` será gerado automaticamente!

## ✅ O Que o Script Faz

1. ✅ Valida o `manifest.json`
2. 🔍 Verifica arquivos obrigatórios (ícones, scripts)
3. 📦 Cria o ZIP com apenas os arquivos necessários
4. 🗑️ Exclui automaticamente: docs, .git, README, etc
5. 📊 Mostra tamanho do arquivo gerado
6. 💬 Oferece abrir a pasta do arquivo

## 📁 Arquivos Incluídos no ZIP

### Arquivos
- `manifest.json`
- `popup.html`
- `popup.css`
- `popup-i18n.js`
- `background.js`
- `content.js`

### Pastas
- `icons/` (todos os ícones: 16, 32, 48, 128)
- `src/` (módulos e traduções)

## 🚫 Arquivos Excluídos

- `.git/`
- `docs/`
- `README.md`
- `CHANGELOG.md`
- `*.ps1` (scripts de build)
- Outros arquivos de desenvolvimento

## 🐛 Solução de Problemas

### Erro de Política de Execução

Se o script não executar:

```powershell
# Permitir execução (uma vez)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Depois execute novamente
.\build-extension.ps1
```

### Arquivos Faltando

O script verificará automaticamente e te avisará se algo estiver faltando.

## 📚 Documentação Completa

Para mais detalhes:
- [Guia Completo de Build](docs/BUILD_GUIDE.md)
- [Textos para Chrome Web Store](docs/CHROME_STORE_LISTING.md)

## 📤 Próximos Passos

Após gerar o ZIP:

1. Acesse: https://chrome.google.com/webstore/devconsole
2. Clique em "New item" (primeira vez) ou atualize item existente
3. Faça upload do `despertador-ponto.zip`
4. Preencha as informações (use o guia em `docs/CHROME_STORE_LISTING.md`)
5. Envie para revisão

Aguarde 1-3 dias úteis para aprovação! 🎉

---

**Dúvidas?** Consulte a documentação completa em `/docs`

# 📦 Guia de Build e Publicação

Este guia explica como gerar o arquivo ZIP para publicar a extensão na Chrome Web Store.

## 🚀 Build Rápido

### Usando PowerShell (Recomendado)

1. Abra o PowerShell no diretório do projeto
2. Execute o script:

```powershell
.\build-extension.ps1
```

3. O arquivo `despertador-ponto.zip` será gerado na raiz do projeto

### Usando Comandos Manuais

Se preferir criar o ZIP manualmente:

```powershell
# Criar ZIP com arquivos essenciais
Compress-Archive -Path manifest.json,popup.html,popup.css,popup-i18n.js,background.js,content.js,icons,src -DestinationPath despertador-ponto.zip -Force
```

## 📋 O Que o Script Faz

O script `build-extension.ps1` realiza as seguintes tarefas:

1. ✅ **Valida o manifest.json**
   - Verifica se o arquivo é válido
   - Exibe nome e versão da extensão

2. 🔍 **Verifica arquivos obrigatórios**
   - Confirma presença de todos os arquivos necessários
   - Verifica ícones em todos os tamanhos (16x16, 32x32, 48x48, 128x128)

3. 📦 **Cria o arquivo ZIP**
   - Inclui apenas os arquivos necessários
   - Exclui documentação, .git, e outros arquivos desnecessários

4. 📊 **Exibe informações**
   - Tamanho do arquivo gerado
   - Localização do arquivo
   - Próximos passos

## 📁 Arquivos Incluídos no ZIP

### Arquivos Principais
- `manifest.json` - Configuração da extensão
- `popup.html` - Interface do popup
- `popup.css` - Estilos
- `popup-i18n.js` - Lógica do popup (com i18n)
- `background.js` - Service Worker
- `content.js` - Script de conteúdo

### Pastas
- `icons/` - Todos os ícones da extensão
  - `icon16.png`
  - `icon32.png`
  - `icon48.png`
  - `icon128.png`
- `src/` - Módulos compartilhados
  - `src/shared/` - Helpers e utilitários
  - `src/locales/` - Traduções (pt-BR, en-US, es)

## 🚫 Arquivos Excluídos

Os seguintes arquivos/pastas **NÃO** são incluídos no ZIP:

- `.git/` - Controle de versão
- `docs/` - Documentação
- `README.md` - Arquivo readme
- `CHANGELOG.md` - Histórico de mudanças
- `.gitignore` - Configuração Git
- `build-extension.ps1` - Script de build
- `*.zip` - ZIPs anteriores
- Arquivos de configuração de desenvolvimento

## ⚠️ Antes de Gerar o Build

### 1. Atualizar Versão

Se for uma nova versão, atualize o `manifest.json`:

```json
{
  "version": "2.1.0"  // Incrementar versão
}
```

### 2. Testar Localmente

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta do projeto
5. Teste todas as funcionalidades

### 3. Verificar Traduções

Certifique-se de que todas as strings estão traduzidas em:
- `src/locales/pt-BR.js`
- `src/locales/en-US.js`
- `src/locales/es.js`

### 4. Revisar Permissões

Verifique se todas as permissões no `manifest.json` são necessárias:

```json
{
  "permissions": [
    "storage",      // ✅ Necessário: salvar dados localmente
    "alarms",       // ✅ Necessário: lembretes
    "notifications", // ✅ Necessário: notificações
    "activeTab",    // ✅ Necessário: acessar aba ativa
    "scripting"     // ✅ Necessário: injetar scripts
  ]
}
```

## 📤 Publicar na Chrome Web Store

Após gerar o ZIP:

### 1. Acesse o Developer Dashboard

[https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)

### 2. Upload

- **Primeira vez**: Clique em "New item" → Upload ZIP
- **Atualização**: Clique no item existente → "Package" tab → "Upload new package"

### 3. Preencha as Informações

- Nome: Despertador Ponto
- Descrição: (veja `docs/PUBLISH_GUIDE.md`)
- Categoria: Productivity
- Idioma: Portuguese (Brazil)
- Screenshots: 3-5 imagens
- Ícone: 128x128px

### 4. Envie para Revisão

- Clique em "Submit for review"
- Aguarde 1-3 dias úteis

## 🐛 Solução de Problemas

### Erro: "Invalid manifest"

- Verifique se o `manifest.json` está válido
- Use um validador JSON online
- Certifique-se de que a versão está no formato correto (ex: "1.0.0")

### Erro: "Missing icons"

- Verifique se a pasta `icons/` existe
- Confirme que todos os ícones estão presentes (16, 32, 48, 128)
- Verifique se os nomes dos arquivos estão corretos

### Erro: "Package is too large"

- Tamanho máximo: 128 MB
- Se ultrapassar, remova arquivos desnecessários
- Otimize imagens

### Script não executa

Se receber erro de política de execução:

```powershell
# Permitir execução de scripts (uma vez)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Ou execute diretamente:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-extension.ps1
```

## 📊 Checklist de Publicação

Antes de enviar para a Chrome Web Store:

- [ ] Versão atualizada no `manifest.json`
- [ ] Todas as funcionalidades testadas localmente
- [ ] Traduções completas (PT/EN/ES)
- [ ] Ícones em todos os tamanhos
- [ ] Screenshots preparados (3-5 imagens)
- [ ] Descrição escrita (detalhada e curta)
- [ ] Tile promocional criado (440x280)
- [ ] Permissões justificadas
- [ ] Política de privacidade declarada
- [ ] Arquivo ZIP gerado com sucesso
- [ ] Tamanho do ZIP < 128 MB

## 🔄 Workflow de Atualização

Para publicar uma atualização:

1. Faça as alterações no código
2. Teste localmente
3. Atualize a versão no `manifest.json`
4. Atualize o `CHANGELOG.md`
5. Execute `.\build-extension.ps1`
6. Faça upload no Developer Dashboard
7. Escreva o que mudou (changelog)
8. Envie para revisão

## 📚 Recursos Adicionais

- [Documentação oficial Chrome Web Store](https://developer.chrome.com/docs/webstore/publish)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/best_practices/)

---

**Dica**: Execute o script sempre antes de publicar para garantir que o ZIP está atualizado e válido! 🚀

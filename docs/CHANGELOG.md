# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [2.0.0] - 2026-01-25

### Adicionado
- 🌐 **Sistema de Internacionalização (i18n)**: Suporte a múltiplos idiomas
- 🇧🇷 Tradução completa para Português (Brasil) - idioma padrão
- 🇺🇸 Tradução completa para English (USA)
- 🇪🇸 Tradução completa para Español
- 🎛️ Seletor de idioma no popup
- 💾 Persistência da preferência de idioma do usuário
- 📐 Arquitetura modular iniciada (`src/shared/`, `src/locales/`)
- 📚 Documentação completa:
  - [I18N_GUIDE.md](I18N_GUIDE.md) - Guia técnico de i18n
  - [I18N_USAGE.md](I18N_USAGE.md) - Como usar o sistema de idiomas
  - [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Plano de refatoração
  - [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura da aplicação
  - [MODULE_EXAMPLE.md](MODULE_EXAMPLE.md) - Exemplo de módulo bem feito

### Modificado
- 🔄 Estrutura do projeto reorganizada para suportar modularização
- 📝 Todos os textos da interface agora são traduzíveis
- 🎨 Interface adaptada para diferentes idiomas
- 📅 Formatação de datas adaptável ao idioma selecionado
- 🔔 Notificações do sistema exibidas no idioma selecionado

### Técnico
- Novo módulo `src/shared/i18n.js` para gerenciar traduções
- Arquivos de tradução em `src/locales/pt-BR.js`, `en-US.js`, `es.js`
- Sistema de singleton para i18n
- Suporte a interpolação de parâmetros nas traduções
- Atributo `data-i18n` para traduções no HTML
- Módulos compartilhados: `constants.js`, `storage-helper.js`, `logger.js`
- Criado `SelectorGenerator.js` como exemplo de módulo refatorado

## [1.2.0] - 2026-01-24

### Adicionado
- Seletor de botão configurável (qualquer página)
- Injeção dinâmica de content script
- Detecção de botão específica por página

### Corrigido
- Loop infinito de erro "Extension context invalidated"
- Overlay do picker bloqueando cliques

## [1.1.0] - 2026-01-23

### Adicionado
- Seletor visual de botão
- Configuração persistente do botão

## [1.0.0] - 2026-01-22

### Adicionado
- Primeira versão funcional
- Registro automático de ponto
- Notificações de saída
- Interface de popup
- Configurações personalizáveis

---

**Legenda**:
- 🌐 Internacionalização
- 🔧 Melhorias
- 🐛 Correções
- 📚 Documentação
- ⚡ Performance
- 🎨 Interface

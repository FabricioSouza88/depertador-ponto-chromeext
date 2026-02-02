# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.2.1] - 2026-01-26

### 🆕 Nova Funcionalidade: Botão de Acesso Rápido ao Sistema

- **Botão "Abrir Sistema de Ponto"**: Novo botão no card de horário de saída
- **Acesso direto**: Abre a URL do sistema de ponto em nova aba com um clique
- **Condicional**: Botão só aparece quando o botão de ponto está configurado
- **Visual moderno**: Gradiente roxo com ícone 🌐
- **Multilíngue**: Traduzido em PT-BR, EN-US e ES

### 🎨 Design

- Botão com gradiente roxo (#6c5ce7 → #a29bfe)
- Posicionado abaixo do botão "Atualizar"
- Efeito hover com elevação e brilho
- Largura total do card para melhor usabilidade

### 🔧 Implementação Técnica

- Salva URL do sistema na configuração `buttonConfig`
- Mostra/oculta automaticamente baseado na configuração
- Usa `chrome.tabs.create()` para abrir em nova aba
- Listener de clique integrado no `setupEventListeners()`

## [2.2.0] - 2026-01-26

### 🆕 Nova Funcionalidade: Lembrete de Entrada Habitual

- **Campo de configuração**: "Horário de Entrada Habitual" (padrão: 08:00)
- **Lembrete automático**: Notifica o usuário 5 minutos após o horário configurado se ele ainda não bateu o ponto
- **Verificação inteligente**: Só envia lembrete se não houver entradas registradas no dia
- **Uma vez por dia**: Lembrete enviado apenas uma vez por dia
- **Multilíngue**: Notificação traduzida em PT-BR, EN-US e ES
- **Tooltip explicativo**: Ícone de ajuda (?) explicando para que serve o campo

### 🔧 Melhorias Técnicas

- Verificação periódica a cada minuto (via alarm `periodic-check`)
- Nova função `AlarmManager.checkAndRemindEntry()` no background
- Nova função `AlarmManager.showEntryReminder()` com suporte a traduções
- Mensagem `settings-updated` do popup para o background
- Flag de lembrete enviado salva localmente por dia
- Reset automático à meia-noite

### 📝 Documentação

- Novo guia completo em `docs/ENTRY_REMINDER.md`
- Fluxo de execução detalhado
- Casos de uso e exemplos
- Instruções de teste e debug
- Troubleshooting

### 🌍 Traduções

Adicionadas em todos os idiomas:
- `settings.usualEntryTime`
- `settings.usualEntryTimeTooltip`
- `notifications.entryReminder.title`
- `notifications.entryReminder.message`

## [2.1.1] - 2025-01-26

### 🆕 Adicionado
- Ícone de ajuda (?) com tooltip na seção "Botão de Ponto"
- Tooltip explicativo traduzido em 3 idiomas (PT-BR, EN-US, ES)
- Atributo `data-i18n-tooltip` para tradução automática de tooltips
- Animação suave de fade in/out no tooltip
- Efeito hover no ícone de ajuda

### 🎨 UX/UI
- Tooltip posicionado acima do ícone com seta indicativa
- Design consistente com a identidade visual da extensão
- Texto claro e direto explicando como configurar o botão
- Cursor "help" indicando elemento de ajuda

### 📝 Documentação
- Guia completo de implementação em `docs/TOOLTIP_FEATURE.md`
- Instruções para adicionar novos tooltips
- Documentação de acessibilidade e responsividade

### 🔧 Técnico
- Método `applyTranslations()` atualizado para suportar tooltips
- CSS com pseudo-elementos `::before` e `::after` para tooltip e seta
- Largura responsiva (max-width: 90vw)

## [2.1.0] - 2025-01-26

### 🆕 Adicionado
- Script PowerShell `build-extension.ps1` para automatizar criação do ZIP de publicação
- Validação automática do `manifest.json` antes do build
- Verificação de arquivos obrigatórios (ícones, scripts, etc)
- Documentação completa de build em `docs/BUILD_GUIDE.md`
- Informações de tamanho e localização do arquivo gerado
- Opção de abrir pasta após build concluído

### 📝 Documentação
- Guia detalhado de build e publicação na Chrome Web Store
- Checklist de pré-publicação
- Workflow de atualização de versões
- Solução de problemas comuns no processo de build
- Instruções de como gerar imagens promocionais
- Lista completa de arquivos incluídos/excluídos do ZIP

### 🔧 Melhorias
- Processo de build agora é totalmente automatizado
- Exclusão automática de arquivos desnecessários do ZIP (docs, .git, etc)
- Feedback visual durante o processo de build com cores e emojis
- README atualizado com instruções de build
- `.gitignore` já configurado para ignorar arquivos ZIP gerados

### 🛠️ Técnico
- Script usa `Compress-Archive` nativo do PowerShell
- Validação JSON do manifest antes de criar o ZIP
- Diretório temporário para staging dos arquivos
- Limpeza automática de arquivos temporários

## [2.0.0] - 2025-01-25

### 🌍 Internacionalização (i18n)
- Suporte a múltiplos idiomas: Português (Brasil), English (USA), Español
- Sistema modular de traduções em `src/locales/`
- Seletor de idioma na interface do popup
- Preferência de idioma salva localmente
- Classe `I18n` centralizada para gerenciamento de traduções
- Interpolação de parâmetros nas traduções
- Todas as strings da UI traduzidas

### 🎓 Tour de Onboarding
- Tour guiado para novos usuários (primeira execução)
- 3 passos interativos explicando funcionalidades principais
- Sistema de spotlight destacando elementos
- Indicadores de progresso visuais
- Botões de navegação (próximo, anterior, pular)
- Status de conclusão salvo localmente
- Classe `TourManager` para gerenciar o tour
- Animações suaves de entrada/saída

### 📝 Documentação
- Guia técnico de i18n (`docs/I18N_GUIDE.md`)
- Guia de uso de i18n (`docs/I18N_USAGE.md`)
- Documentação do tour (`docs/TOUR_ONBOARDING.md`)
- CHANGELOG atualizado
- README com novas funcionalidades

### 🔧 Melhorias
- `popup-i18n.js` substituindo `popup.js` com suporte completo a i18n
- Atributos `data-i18n` em todos os elementos HTML
- Sistema singleton para instância do i18n
- Método `applyTranslations()` para atualizar interface
- Tratamento de erros melhorado

## [1.5.0] - 2025-01-24

### 🎯 Seletor de Botão Configurável
- Seletor visual de botão por clique na página
- Funciona em qualquer sistema de ponto online
- Overlay com feedback visual ao selecionar elementos
- Remoção de dependências hardcoded do sistema Ahgora
- Detecção apenas na página onde o botão foi configurado
- Armazenamento da configuração do botão (selector + URL)

### 🔧 Melhorias Técnicas
- Injeção dinâmica de content scripts usando `chrome.scripting.executeScript`
- Classe `ElementPicker` para seleção visual de elementos
- Validação de contexto da extensão para prevenir erros
- Flag `contextInvalidated` no `ClickDetector`
- Cleanup automático de observers ao invalidar contexto
- Logs detalhados para debugging

### 🐛 Correções
- Corrigido erro de loop infinito "Extension context invalidated"
- Corrigido overlay bloqueando cliques (adicionado `pointer-events: none`)
- Corrigido content script não injetando em páginas abertas
- Melhor tratamento de erros em `chrome.storage` e `chrome.runtime`

### 📚 Documentação
- Toda documentação movida para pasta `/docs`
- `REFACTORING_PLAN.md` - Plano de refatoração
- `ARCHITECTURE.md` - Arquitetura do sistema
- `MODULE_EXAMPLE.md` - Exemplo de módulo refatorado

## [1.0.0] - 2025-01-23

### 🎉 Lançamento Inicial
- Registro automático de batidas de ponto
- Detecção de cliques no botão configurado (Ahgora)
- Múltiplas entradas por dia
- Cálculo automático de horário de saída
- Notificações inteligentes (5min, 1min antes da saída)
- Interface moderna com gradiente roxo
- Adição manual de entradas
- Remoção individual de entradas
- Configurações personalizáveis (horas de trabalho, intervalo)
- Persistência de dados com `chrome.storage.local`
- Service Worker (Manifest V3)
- Barra de progresso visual
- Ícones em múltiplos tamanhos

### 🛠️ Técnico
- Manifest V3 (última versão)
- Classes modulares:
  - `StorageManager` - Gerenciamento de storage
  - `TimeCalculator` - Cálculos de tempo
  - `UIManager` - Interface do usuário
  - `ClickDetector` - Detecção de cliques
  - `AlarmManager` - Gerenciamento de alarmes
- Content script para interação com páginas
- Background service worker para alarmes
- Permissões: storage, alarms, notifications, activeTab, scripting

### 🎨 Design
- Interface clean e intuitiva
- Cards com sombras e bordas arredondadas
- Gradiente de fundo (roxo)
- Ícones emoji para melhor UX
- Responsivo e compacto (380px)
- Scrollbar customizada
- Animações suaves nos botões

---

## Tipos de Mudanças

- 🆕 **Adicionado**: para novas funcionalidades
- 🔧 **Melhorias**: para mudanças em funcionalidades existentes
- 🐛 **Correções**: para correção de bugs
- ⚠️ **Depreciado**: para funcionalidades que serão removidas
- 🗑️ **Removido**: para funcionalidades removidas
- 🔒 **Segurança**: para vulnerabilidades corrigidas
- 📝 **Documentação**: para mudanças na documentação
- 🛠️ **Técnico**: para mudanças técnicas/internas

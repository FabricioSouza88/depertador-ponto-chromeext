# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.5] - 2026-01-15

### Alterado
- 🔕 **Notificação de 15 minutos removida**: agora mantém apenas 5 min, 1 min e a principal na hora

### Corrigido
- ⏰ **Notificação principal garantida**: marca `notified_exit` também quando o alarme principal dispara, evitando falhas por duplicidade

## [1.0.4] - 2026-01-15

### Corrigido
- ⏰ **Notificação na hora de sair**: adicionada verificação via `periodic-check` para garantir o aviso mesmo se o alarme principal falhar

### Adicionado
- ⏱️ **Notificação de 1 minuto antes**: novo aviso entre 1-2 minutos antes do horário de saída

## [1.0.3] - 2026-01-15

### Corrigido
- 🔔 **Notificações de aviso não apareciam**: prioridade elevada, `requireInteraction` e som ativados

## [1.0.2] - 2026-01-15

### Adicionado
- 🧪 Logs detalhados para debug de notificações e alarmes

## [1.0.1] - 2026-01-15

### Corrigido
- 🐛 **Notificações de 15 e 5 minutos não eram enviadas**: Implementado sistema de range (14-16 min e 4-6 min) em vez de comparação exata
- 🔄 **Alarme periódico podia ser perdido**: Adicionado verificação e recriação automática do `periodic-check` ao iniciar
- 🚫 **Notificações duplicadas**: Implementado sistema de flags para prevenir múltiplas notificações
- 📊 **Logs melhorados**: Adicionados logs detalhados para facilitar debug (`🔍 Verificando: faltam X minutos`)

### Melhorado
- ⚡ Sistema de notificações mais resiliente e confiável
- 🎯 Maior tolerância a atrasos no timer (±1 minuto de margem)
- 🔍 Melhor rastreabilidade com logs no console do Service Worker

## [1.0.0] - 2026-01-15

### Adicionado
- ✨ Detecção automática de batida de ponto na página do Ahgora
- ⏰ Cálculo automático do horário de saída
- 🔔 Sistema de notificações (15min, 5min e na hora)
- 📊 Interface de popup com visualização de registros
- ⚙️ Configurações personalizáveis (horas de trabalho e intervalo)
- 📝 Entrada manual de registros
- 🗑️ Remoção individual de registros
- 📈 Barra de progresso do dia de trabalho
- 💾 Armazenamento local de registros
- 🎨 Interface moderna e responsiva
- 📱 Suporte a múltiplas entradas por dia
- 🔄 Recálculo automático ao adicionar/remover entradas
- 🌙 Limpeza automática à meia-noite
- 👁️ Indicador visual no botão de ponto do Ahgora
- 📣 Feedback visual ao registrar ponto
- ⏱️ Timer em tempo real do tempo restante
- 🎯 Alarmes persistentes

### Características Técnicas
- Manifest V3 (versão mais recente do Chrome)
- Service Worker para processos em background
- Content Script para injeção na página
- Chrome Storage API
- Chrome Alarms API
- Chrome Notifications API
- Arquitetura modular e orientada a objetos
- Código bem documentado e limpo
- Tratamento de erros robusto
- Debounce para evitar ações duplicadas

### Documentação
- README completo com instruções
- Guia rápido de instalação
- Documentação de desenvolvimento
- Troubleshooting guide
- Licença MIT

## [Unreleased]

### Planejado para próximas versões
- [ ] Histórico de registros (últimos 30 dias)
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Integração com Google Calendar
- [ ] Suporte a outros sistemas de ponto
- [ ] Estatísticas e dashboards
- [ ] Dark mode
- [ ] Sincronização entre dispositivos
- [ ] Sons personalizados
- [ ] Modo offline
- [ ] Backup e restauração de dados

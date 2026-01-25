# 🏗️ Arquitetura - Despertador Ponto

## 📐 Visão Geral

Esta extensão segue uma arquitetura modular baseada em responsabilidades, facilitando manutenção e escalabilidade.

## 🎨 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐    ┌────────────────┐   ┌─────────────┐ │
│  │  Popup UI     │    │  Content       │   │  Background │ │
│  │  (popup.js)   │    │  Scripts       │   │  Service    │ │
│  │               │    │  (content.js)  │   │  Worker     │ │
│  └───────┬───────┘    └────────┬───────┘   └──────┬──────┘ │
│          │                     │                   │         │
│          └─────────────────────┼───────────────────┘         │
│                                │                             │
│                    ┌───────────▼────────────┐               │
│                    │  Shared Modules        │               │
│                    │  - Constants           │               │
│                    │  - StorageHelper       │               │
│                    │  - Logger              │               │
│                    └────────────────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Chrome APIs          │
                │  - storage.local      │
                │  - alarms             │
                │  - notifications      │
                │  - runtime            │
                └──────────────────────┘
```

## 📦 Módulos

### 1. Shared Modules (Compartilhados)

#### `constants.js`
**Responsabilidade**: Constantes globais da aplicação

**Exports**:
- `CONFIG`: Configurações gerais
- `MESSAGES`: Mensagens de UI
- `STORAGE_KEYS`: Chaves do chrome.storage

**Usado por**: Todos os módulos

#### `storage-helper.js`
**Responsabilidade**: Abstração segura do chrome.storage

**Features**:
- Validação de contexto
- Tratamento de erros
- Promises consistentes
- Type safety implícito

**Usado por**: Todos os módulos que precisam persistir dados

#### `logger.js`
**Responsabilidade**: Logging consistente e debugável

**Features**:
- Logs formatados com emojis
- Namespace por módulo
- Níveis: info, success, warn, error, debug

**Usado por**: Todos os módulos

### 2. Content Scripts

#### `ClickDetector.js`
**Responsabilidade**: Detectar e registrar cliques no botão configurado

**Lifecycle**:
```
init() → observeDOM() → findButton() → attachClickListener() → handleClick() → registerEntry()
```

**Dependencies**:
- StorageHelper (ler configuração)
- Logger (logs)

#### `SelectorGenerator.js`
**Responsabilidade**: Gerar CSS selectors únicos

**Algorithm**:
1. Tenta ID único
2. Tenta data-testid, data-test
3. Tenta aria-label
4. Constrói path com classes
5. Fallback: nth-of-type

**Dependencies**: Nenhuma (standalone)

#### `ElementPicker.js`
**Responsabilidade**: UI para seleção visual de elementos

**Features**:
- Overlay com pointer-events: none
- Highlight on hover
- Click capture
- ESC to cancel

**Dependencies**:
- SelectorGenerator (gerar selector)
- StorageHelper (salvar configuração)
- Constants (IDs, z-index)

#### `content.js` (Entry Point)
**Responsabilidade**: Orquestrar módulos e responder mensagens

**Tasks**:
- Inicializar ClickDetector e ElementPicker
- Router de mensagens do popup
- Lifecycle management

### 3. Popup Scripts

#### `StorageManager.js`
**Responsabilidade**: CRUD de entradas de ponto e configurações

**API**:
```javascript
getEntriesToday()     // Retorna entries de hoje
addEntry(time, src)   // Adiciona nova entry
removeEntry(time)     // Remove entry
getSettings()         // Retorna config
saveSettings(cfg)     // Salva config
```

**Dependencies**:
- StorageHelper

#### `TimeCalculator.js`
**Responsabilidade**: Cálculos de tempo e formatação

**API**:
```javascript
calculateExitTime(entries, settings)  // Calcula horário de saída
formatTime(date)                      // HH:MM
formatDate(date)                      // Formato longo BR
getTimeRemaining(exitTime)            // "Xh Ymin"
calculateProgress(...)                // Porcentagem
```

**Dependencies**: Nenhuma (pure functions)

#### `UIManager.js`
**Responsabilidade**: Gerenciar toda a interface do popup

**Features**:
- Event listeners
- Atualização de UI
- Comunicação com content scripts
- Validações de entrada

**Dependencies**:
- StorageManager
- TimeCalculator
- Logger

#### `popup.js` (Entry Point)
**Responsabilidade**: Inicializar UI Manager

**Simple**:
```javascript
const ui = new UIManager();
ui.init();
```

### 4. Background Scripts

#### `AlarmManager.js`
**Responsabilidade**: Gerenciar alarmes do Chrome

**Features**:
- Criar alarme principal
- Periodic check
- Reminder alarms
- Clear alarms

**Dependencies**:
- StorageHelper
- NotificationManager

#### `NotificationManager.js`
**Responsabilidade**: Gerenciar notificações

**Features**:
- Notificação de saída
- Warnings (5min, 1min)
- Click handlers
- Action buttons

**Dependencies**:
- AlarmManager (reminder)

#### `background.js` (Entry Point)
**Responsabilidade**: Configurar listeners

**Listeners**:
- chrome.alarms.onAlarm
- chrome.notifications.onClicked
- chrome.runtime.onMessage

## 🔄 Fluxo de Dados

### Fluxo 1: Usuário Configura Botão

```
User clicks "Selecionar Botão"
    ↓
Popup (UIManager.startButtonPicker())
    ↓
chrome.tabs.sendMessage({action: 'startPicker'})
    ↓
Content (message listener)
    ↓
ElementPicker.start()
    ↓
User clicks element
    ↓
SelectorGenerator.generate(element)
    ↓
StorageHelper.set('buttonConfig', config)
    ↓
Popup shows success
```

### Fluxo 2: Usuário Bate Ponto

```
User clicks configured button
    ↓
Content (ClickDetector.handleClick())
    ↓
chrome.runtime.sendMessage({action: 'registerEntry'})
    ↓
Background (message listener)
    ↓
StorageHelper.set(entriesKey, [...entries, new])
    ↓
AlarmManager.createAlarm(exitTime)
    ↓
chrome.alarms.create(...)
    ↓
User sees notification
```

### Fluxo 3: Alarme Dispara

```
chrome.alarms.onAlarm fires
    ↓
Background (AlarmManager.handleAlarm())
    ↓
Check alarm type (main / periodic / reminder)
    ↓
NotificationManager.showExitNotification()
    ↓
chrome.notifications.create(...)
    ↓
User clicks notification
    ↓
chrome.notifications.onClicked
    ↓
Handle action (dismiss / remind)
```

## 🔐 Segurança

### Context Validation

Todos os módulos que usam Chrome APIs verificam contexto:

```javascript
if (!chrome.runtime?.id) {
  logger.error('Contexto inválido');
  return;
}
```

### Error Boundaries

Cada módulo trata seus próprios erros:

```javascript
try {
  await operation();
} catch (error) {
  logger.error('Operação falhou:', error);
  // Graceful degradation
}
```

### Input Validation

```javascript
// StorageManager.addEntry()
if (!timestamp || typeof timestamp !== 'number') {
  throw new Error('Invalid timestamp');
}
```

## 📊 Estado da Aplicação

### Chrome Storage Schema

```javascript
{
  // Botão configurado
  "buttonConfig": {
    "selector": "button.MuiButton-root",
    "pageUrl": "https://...",
    "pageTitle": "Sistema de Ponto",
    "timestamp": "2026-01-25T..."
  },
  
  // Entradas do dia
  "entries_2026-01-25": [
    { "timestamp": 1737820800000, "source": "auto" },
    { "timestamp": 1737824400000, "source": "manual" }
  ],
  
  // Configurações
  "settings": {
    "workHours": 8,
    "breakMinutes": 60
  },
  
  // Estado dos alarmes
  "alarmInfo": {
    "exitTime": "2026-01-25T17:00:00",
    "entries": [...]
  },
  
  // Flags de notificação
  "notified_5min": false,
  "notified_1min": false,
  "notified_exit": false
}
```

## 🧪 Testabilidade

### Unit Tests (Futuro)

Cada módulo pode ser testado isoladamente:

```javascript
// SelectorGenerator.test.js
import { SelectorGenerator } from './SelectorGenerator.js';

test('generates ID selector', () => {
  const el = { id: 'test', tagName: 'BUTTON' };
  expect(SelectorGenerator.generate(el)).toBe('#test');
});
```

### Integration Tests

```javascript
// content.integration.test.js
import { ClickDetector } from './ClickDetector.js';
import { ElementPicker } from './ElementPicker.js';

test('full flow: pick element → save → detect click', async () => {
  // Setup
  const picker = new ElementPicker();
  picker.start();
  
  // Simulate click
  const button = document.querySelector('button');
  simulateClick(button);
  
  // Assert
  const config = await StorageHelper.get('buttonConfig');
  expect(config.selector).toBeTruthy();
});
```

## 📈 Métricas e Monitoramento

### Performance

```javascript
// Logger com timestamps
logger.debug('Operation started');
// ... operation
logger.debug('Operation completed', performance.now() - start);
```

### Erro Tracking

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Uncaught error:', event.error);
  // Pode enviar para serviço de monitoramento
});
```

## 🔄 Lifecycle

### Extension Install
```
chrome.runtime.onInstalled
  ↓
Initialize default settings
  ↓
Setup periodic-check alarm
```

### Extension Update
```
chrome.runtime.onInstalled (reason: 'update')
  ↓
Migrate old data if needed
  ↓
Re-create alarms
```

### Browser Startup
```
chrome.runtime.onStartup
  ↓
Restore active alarms
  ↓
Re-enable periodic checks
```

## 📚 Convenções de Código

### Naming

- **Classes**: PascalCase (`ElementPicker`)
- **Functions**: camelCase (`findButton`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEBOUNCE_TIME`)
- **Files**: PascalCase for classes, kebab-case for utils

### Comments

```javascript
/**
 * Genera un selector CSS único para el elemento
 * @param {HTMLElement} element - Elemento DOM
 * @returns {string} CSS selector
 */
static generate(element) {
  // ...
}
```

### Imports

```javascript
// External dependencies primeiro
import { Logger } from '../shared/logger.js';

// Internal dependencies
import { SelectorGenerator } from './SelectorGenerator.js';

// Constants por último
import { CONFIG } from '../shared/constants.js';
```

---

**Versão**: 2.0.0 (Arquitetura Modular)
**Última Atualização**: 2026-01-25
**Mantido por**: Equipe Despertador Ponto

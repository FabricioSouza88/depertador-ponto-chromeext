# 📐 Plano de Refatoração - Arquitetura Modular

## 🎯 Objetivo

Transformar o código monolítico em uma arquitetura modular, seguindo boas práticas e facilitando manutenção.

## 📊 Estrutura Atual vs Proposta

### Antes (Monolítico):
```
despertador-ponto/
├── content.js      (835 linhas - 5 classes)
├── popup.js        (472 linhas - 3 classes)  
├── background.js   (385 linhas - 2 classes)
```

### Depois (Modular):
```
despertador-ponto/
├── src/
│   ├── shared/                    # Código compartilhado
│   │   ├── constants.js           # Constantes globais
│   │   ├── storage-helper.js      # Helper para chrome.storage
│   │   └── logger.js              # Sistema de logging
│   │
│   ├── content/                   # Content Scripts
│   │   ├── ClickDetector.js       # Detecta cliques no botão
│   │   ├── ElementPicker.js       # Seletor visual de elementos
│   │   ├── SelectorGenerator.js   # Gera CSS selectors
│   │   └── content.js             # Entry point (coordenador)
│   │
│   ├── popup/                     # Popup UI
│   │   ├── StorageManager.js      # Gerencia dados locais
│   │   ├── TimeCalculator.js      # Cálculos de tempo
│   │   ├── UIManager.js           # Gerencia interface
│   │   └── popup.js               # Entry point
│   │
│   └── background/                # Service Worker
│       ├── AlarmManager.js        # Gerencia alarmes
│       ├── NotificationManager.js # Gerencia notificações
│       └── background.js          # Entry point
│
├── content.js (deprecated)        # Manter por compatibilidade
├── popup.js (deprecated)
├── background.js (deprecated)
```

## 🔧 Benefícios da Refatoração

### 1. **Separação de Responsabilidades**
- Cada classe tem uma responsabilidade única
- Fácil de entender e modificar
- Testável isoladamente

### 2. **Reusabilidade**
- `StorageHelper` usado em todos os módulos
- `Logger` consistente em todo o projeto
- Constantes centralizadas

### 3. **Manutenibilidade**
- Bugs mais fáceis de localizar
- Mudanças isoladas não quebram outros módulos
- Code review mais eficiente

### 4. **Escalabilidade**
- Fácil adicionar novos módulos
- Estrutura clara para novos desenvolvedores
- Pronto para testes automatizados

## 📝 Plano de Migração

### Fase 1: Shared Modules (✅ Concluído)

#### 1.1. Constants (`src/shared/constants.js`)
```javascript
export const CONFIG = {
  DEBOUNCE_TIME: 1000,
  Z_INDEX: { OVERLAY: 999998, TOOLTIP: 999999 },
  ELEMENT_IDS: { OVERLAY: '...', TOOLTIP: '...' },
  STORAGE_KEYS: { BUTTON_CONFIG: '...', ... },
  DEFAULTS: { WORK_HOURS: 8, BREAK_MINUTES: 60 }
};

export const MESSAGES = {
  PICKER: { TOOLTIP: '...', SUCCESS: '...', ... },
  NOTIFICATIONS: { REGISTERED: '...', ... },
  ERRORS: { NO_TAB: '...', ... }
};
```

#### 1.2. StorageHelper (`src/shared/storage-helper.js`)
```javascript
export class StorageHelper {
  static isContextValid()
  static async get(key)
  static async set(key, value)
  static async remove(key)
  static async clear()
}
```

#### 1.3. Logger (`src/shared/logger.js`)
```javascript
export class Logger {
  constructor(module)
  info(...args)
  success(...args)
  warn(...args)
  error(...args)
  debug(...args)
}
```

### Fase 2: Content Scripts

#### 2.1. ClickDetector (`src/content/ClickDetector.js`)
**Responsabilidade**: Detectar e registrar cliques no botão configurado

**Extração**:
- Classe `ClickDetector` do `content.js` (linhas 12-305)
- Métodos:
  - `init()` - Inicializa detector
  - `observeDOM()` - Observa mudanças no DOM
  - `findButton()` - Localiza botão configurado
  - `attachClickListener()` - Anexa listener
  - `handleClick()` - Trata clique
  - `registerEntry()` - Registra ponto

**Imports**:
```javascript
import { CONFIG, STORAGE_KEYS } from '../shared/constants.js';
import { StorageHelper } from '../shared/storage-helper.js';
import { Logger } from '../shared/logger.js';
```

#### 2.2. SelectorGenerator (`src/content/SelectorGenerator.js`)
**Responsabilidade**: Gerar CSS selectors únicos e robustos

**Extração**:
- Métodos de `ElementPicker`:
  - `generateSelector()`
  - `generateNthSelector()`
  
**Interface**:
```javascript
export class SelectorGenerator {
  static generate(element) {
    // Try ID, data-*, aria-label, classes, nth-of-type
    return selector;
  }
  
  static validate(selector, expectedElement) {
    return document.querySelector(selector) === expectedElement;
  }
}
```

#### 2.3. ElementPicker (`src/content/ElementPicker.js`)
**Responsabilidade**: Interface visual para selecionar elementos

**Extração**:
- Classe `ElementPicker` do `content.js` (linhas 307-670)
- Foca apenas em UI e interação
- Usa `SelectorGenerator` para gerar selectors

**Métodos**:
```javascript
export class ElementPicker {
  start()               // Inicia picker
  stop()                // Para picker
  createOverlay()       // Cria UI
  handleMouseOver()     // Destaca elementos
  handleClick()         // Captura seleção
  saveSelector()        // Salva configuração
}
```

#### 2.4. Content Entry Point (`src/content/content.js`)
**Responsabilidade**: Coordenar módulos e responder mensagens

```javascript
import { ClickDetector } from './ClickDetector.js';
import { ElementPicker } from './ElementPicker.js';
import { Logger } from '../shared/logger.js';

const logger = new Logger('Content');
let detector = null;
let picker = null;

// Inicialização
function init() {
  if (!chrome.runtime?.id) {
    logger.error('Contexto inválido. Recarregue a página (F5).');
    return;
  }
  
  detector = new ClickDetector();
  detector.init();
  
  picker = new ElementPicker();
  logger.success('Content script inicializado');
}

// Message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... routing de mensagens
});

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### Fase 3: Popup Scripts

#### 3.1. StorageManager (`src/popup/StorageManager.js`)
**Extração**: Classe `StorageManager` do `popup.js` (linhas 1-57)

```javascript
import { STORAGE_KEYS, DEFAULTS } from '../shared/constants.js';
import { StorageHelper } from '../shared/storage-helper.js';

export class StorageManager {
  static async getEntriesToday()
  static async addEntry(timestamp, source)
  static async removeEntry(timestamp)
  static async clearToday()
  static async getSettings()
  static async saveSettings(settings)
  static getTodayKey()
}
```

#### 3.2. TimeCalculator (`src/popup/TimeCalculator.js`)
**Extração**: Classe `TimeCalculator` do `popup.js` (linhas 59-121)

```javascript
export class TimeCalculator {
  static calculateExitTime(entries, settings)
  static formatTime(date)
  static formatDate(date)
  static getTimeRemaining(exitTime)
  static calculateProgress(entries, exitTime, settings)
}
```

#### 3.3. UIManager (`src/popup/UIManager.js`)
**Extração**: Classe `UIManager` do `popup.js` (linhas 123-434)

**Responsabilidade**: Gerenciar toda a interface do popup

```javascript
import { StorageManager } from './StorageManager.js';
import { TimeCalculator } from './TimeCalculator.js';
import { Logger } from '../shared/logger.js';

export class UIManager {
  constructor()
  init()
  setupEventListeners()
  refreshUI()
  addManualEntry()
  loadSelectorStatus()
  startButtonPicker()
  clearButtonSelector()
  // ... outros métodos
}
```

#### 3.4. Popup Entry Point (`src/popup/popup.js`)
```javascript
import { UIManager } from './UIManager.js';
import { Logger } from '../shared/logger.js';

const logger = new Logger('Popup');

document.addEventListener('DOMContentLoaded', () => {
  logger.info('Inicializando popup');
  const ui = new UIManager();
  ui.init();
  logger.success('Popup inicializado');
});
```

### Fase 4: Background Scripts

#### 4.1. AlarmManager (`src/background/AlarmManager.js`)
**Extração**: Classe `AlarmManager` do `background.js`

```javascript
import { CONFIG, STORAGE_KEYS } from '../shared/constants.js';
import { StorageHelper } from '../shared/storage-helper.js';
import { NotificationManager } from './NotificationManager.js';

export class AlarmManager {
  static async createAlarm(exitTime, entries)
  static async checkUpcomingExit()
  static clearAlarms()
  static async handleAlarm(alarm)
}
```

#### 4.2. NotificationManager (`src/background/NotificationManager.js`)
**Extração**: Métodos de notificação do `background.js`

```javascript
export class NotificationManager {
  static async showExitNotification()
  static async showWarningNotification(minutes)
  static handleNotificationClick(notificationId)
  static createReminderAlarm()
}
```

#### 4.3. Background Entry Point (`src/background/background.js`)
```javascript
import { AlarmManager } from './AlarmManager.js';
import { NotificationManager } from './NotificationManager.js';
import { StorageHelper } from '../shared/storage-helper.js';
import { Logger } from '../shared/logger.js';

const logger = new Logger('Background');

// Alarm listeners
chrome.alarms.onAlarm.addListener(AlarmManager.handleAlarm);

// Notification listeners
chrome.notifications.onClicked.addListener(
  NotificationManager.handleNotificationClick
);

// Message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... routing
});

logger.success('Service worker inicializado');
```

## 🔄 Atualização do Manifest

### Manifest V3 com ES Modules

```json
{
  "manifest_version": 3,
  "name": "Despertador Ponto",
  "version": "2.0.0",
  
  "background": {
    "service_worker": "src/background/background.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["src/content/content.js"],
      "type": "module"
    }
  ],
  
  "action": {
    "default_popup": "popup.html"
  }
}
```

### Atualização do popup.html

```html
<script type="module" src="src/popup/popup.js"></script>
```

## 📦 Compatibilidade e Migração Gradual

### Estratégia: Manter Arquivos Antigos Temporariamente

1. **Criar novos módulos** em `src/`
2. **Manter arquivos atuais** funcionando
3. **Testar cada módulo** isoladamente
4. **Migrar progressivamente**:
   - Semana 1: Content scripts
   - Semana 2: Popup scripts
   - Semana 3: Background scripts
5. **Remover arquivos antigos** após testes completos

### Teste de Cada Módulo

```javascript
// Exemplo: Testar SelectorGenerator isoladamente
import { SelectorGenerator } from './SelectorGenerator.js';

// Criar elemento de teste
const button = document.createElement('button');
button.id = 'test-button';
document.body.appendChild(button);

// Gerar selector
const selector = SelectorGenerator.generate(button);
console.log('Selector:', selector); // #test-button

// Validar
const isValid = SelectorGenerator.validate(selector, button);
console.log('Válido?', isValid); // true
```

## 🧪 Testes Automatizados (Futuro)

Com código modular, fica fácil adicionar testes:

```javascript
// tests/SelectorGenerator.test.js
import { SelectorGenerator } from '../src/content/SelectorGenerator.js';

describe('SelectorGenerator', () => {
  test('should generate ID selector', () => {
    const el = createElementWithId('test');
    expect(SelectorGenerator.generate(el)).toBe('#test');
  });
  
  test('should validate selector', () => {
    const el = document.querySelector('#test');
    expect(SelectorGenerator.validate('#test', el)).toBe(true);
  });
});
```

## 📚 Documentação de Cada Módulo

Cada arquivo deve ter:

```javascript
/**
 * @module SelectorGenerator
 * @description Gera CSS selectors únicos e robustos para elementos DOM
 * 
 * @example
 * const selector = SelectorGenerator.generate(buttonElement);
 * // Returns: "#button-id" ou ".class1.class2" ou "button:nth-of-type(1)"
 */
```

## 🎯 Próximos Passos

### Imediato:
1. ✅ Criar estrutura de pastas
2. ✅ Criar módulos compartilhados (constants, storage, logger)
3. ⏳ Extrair ClickDetector
4. ⏳ Extrair SelectorGenerator
5. ⏳ Extrair ElementPicker

### Curto Prazo:
6. ⏳ Refatorar popup scripts
7. ⏳ Refatorar background scripts
8. ⏳ Atualizar manifest.json
9. ⏳ Testes manuais completos

### Médio Prazo:
10. ⏳ Adicionar JSDoc em todos os módulos
11. ⏳ Configurar ESLint/Prettier
12. ⏳ Criar testes automatizados
13. ⏳ CI/CD pipeline

## 💡 Boas Práticas Implementadas

1. **Single Responsibility Principle**: Cada módulo tem uma responsabilidade
2. **DRY**: Código compartilhado em `shared/`
3. **Dependency Injection**: Passa dependências ao invés de instanciar
4. **Consistent Naming**: Padrões claros de nomenclatura
5. **Error Handling**: Tratamento consistente de erros
6. **Logging**: Sistema de logs padronizado
7. **Documentation**: JSDoc em todos os módulos públicos

## 📊 Métricas de Sucesso

### Antes da Refatoração:
- **Linhas por arquivo**: 300-800
- **Classes por arquivo**: 2-5
- **Complexidade**: Alta (tudo interconectado)
- **Testabilidade**: Baixa
- **Onboarding**: Difícil (código monolítico)

### Depois da Refatoração:
- **Linhas por arquivo**: 50-200
- **Classes por arquivo**: 1
- **Complexidade**: Baixa (responsabilidades claras)
- **Testabilidade**: Alta (módulos isolados)
- **Onboarding**: Fácil (estrutura clara)

---

**Status**: 🟡 Em Progresso (Fase 1 concluída)
**Próximo**: Extrair ClickDetector para módulo separado
**ETA**: 2-3 dias para refatoração completa

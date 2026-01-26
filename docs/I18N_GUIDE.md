# 🌐 Guia de Internacionalização (i18n)

## 📖 Visão Geral

O Despertador Ponto agora suporta múltiplos idiomas! Os usuários podem escolher entre:

- 🇧🇷 **Português (Brasil)** - Idioma padrão
- 🇺🇸 **English (USA)**
- 🇪🇸 **Español**

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── locales/              # Arquivos de tradução
│   ├── pt-BR.js         # Português (padrão)
│   ├── en-US.js         # Inglês
│   └── es.js            # Espanhol
│
└── shared/
    └── i18n.js          # Sistema de i18n
```

### Sistema de i18n

O sistema de i18n é baseado em:
1. **Singleton Pattern** - Uma única instância em toda a extensão
2. **Storage Persistence** - Preferência salva em `chrome.storage.local`
3. **Dynamic Loading** - Carregamento dinâmico de traduções
4. **Dot Notation** - Acesso a traduções por caminho (ex: `popup.entries.title`)

## 📝 Como Usar

### 1. Importar o Sistema

```javascript
import { getI18n, t } from './src/shared/i18n.js';

// Obter instância
const i18n = getI18n();
await i18n.init();
```

### 2. Traduzir Textos

#### Método Completo:
```javascript
const i18n = getI18n();
const text = i18n.t('popup.entries.title'); // "Registros do Dia"
```

#### Helper Rápido:
```javascript
import { t } from './src/shared/i18n.js';

const text = t('popup.entries.empty'); // "Nenhuma entrada registrada hoje"
```

### 3. Interpolação de Parâmetros

```javascript
// No arquivo de tradução:
message: 'Olá, {name}! Você tem {count} mensagens.'

// No código:
const text = i18n.t('message', { name: 'João', count: 5 });
// Resultado: "Olá, João! Você tem 5 mensagens."
```

### 4. No HTML (com data-i18n)

```html
<h2 data-i18n="popup.entries.title">Registros do Dia</h2>
<button data-i18n="popup.button.select">Selecionar Botão</button>
```

**Aplicar traduções:**
```javascript
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18n.t(key);
  });
}
```

## 🔧 Adicionar Novo Idioma

### Passo 1: Criar Arquivo de Tradução

Criar `src/locales/fr.js` (exemplo para Francês):

```javascript
export const fr = {
  language: 'Français',
  code: 'fr',
  
  popup: {
    title: 'Réveil de Pointage',
    today: "Aujourd'hui",
    
    entries: {
      title: "Entrées d'Aujourd'hui",
      empty: "Aucune entrée enregistrée aujourd'hui",
      automatic: 'Automatique',
      manual: 'Manuel',
      // ...
    },
    // ...
  },
  // ...
};
```

### Passo 2: Registrar no Sistema

Editar `src/shared/i18n.js`:

```javascript
import { ptBR } from '../locales/pt-BR.js';
import { enUS } from '../locales/en-US.js';
import { es } from '../locales/es.js';
import { fr } from '../locales/fr.js'; // ← Adicionar

const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es': es,
  'fr': fr // ← Adicionar
};
```

### Passo 3: Adicionar ao Seletor

Editar `popup.html`:

```html
<select id="language-select" class="language-select">
  <option value="pt-BR">Português (Brasil)</option>
  <option value="en-US">English (USA)</option>
  <option value="es">Español</option>
  <option value="fr">Français</option> <!-- ← Adicionar -->
</select>
```

### Passo 4: Atualizar Traduções

Adicionar em **todos** os arquivos de tradução:

```javascript
// pt-BR.js
language: {
  // ...
  french: 'Français'
}

// en-US.js
language: {
  // ...
  french: 'Français'
}

// es.js
language: {
  // ...
  french: 'Français'
}
```

## 📋 Estrutura de Tradução

### Hierarquia Completa

```javascript
{
  language: 'Nome do Idioma',
  code: 'codigo',
  
  popup: {
    title: '...',
    today: '...',
    
    entries: {
      title: '...',
      empty: '...',
      automatic: '...',
      manual: '...',
      remove: '...',
      addManual: '...',
      timePlaceholder: '...',
      add: '...'
    },
    
    exit: {
      title: '...',
      programmed: '...',
      remaining: '...',
      noEntries: '...',
      timeToLeave: '...',
      calculate: '...'
    },
    
    settings: {
      title: '...',
      workHours: '...',
      breakMinutes: '...',
      save: '...',
      clearToday: '...'
    },
    
    button: {
      title: '...',
      status: '...',
      configured: '...',
      notConfigured: '...',
      page: '...',
      url: '...',
      selector: '...',
      select: '...',
      clear: '...'
    },
    
    language: {
      title: '...',
      label: '...',
      portuguese: '...',
      english: '...',
      spanish: '...'
    },
    
    notifications: {
      entryAdded: '...',
      entryRemoved: '...',
      settingsSaved: '...',
      recordsCleared: '...',
      buttonConfigured: '...',
      configRemoved: '...',
      selectTime: '...',
      languageChanged: '...'
    }
  },
  
  picker: {
    tooltip: '...',
    success: '...',
    error: '...',
    contextInvalid: '...',
    clickInstruction: '...'
  },
  
  systemNotifications: {
    registered: '...',
    exitTime: '...',
    warning5min: '...',
    warning1min: '...',
    remind5min: '...',
    dismiss: '...'
  },
  
  errors: {
    noTab: '...',
    restrictedPage: '...',
    injectionFailed: '...',
    pickerFailed: '...',
    invalidResponse: '...',
    generalError: '...'
  },
  
  confirmations: {
    clearRecords: '...',
    clearButton: '...'
  }
}
```

## 🔄 Trocar Idioma Programaticamente

### No Popup

```javascript
const i18n = getI18n();

// Trocar idioma
await i18n.changeLanguage('en-US');

// Reaplicar traduções
applyTranslations();
```

### No Content Script

```javascript
// Content scripts recebem notificação quando idioma muda
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'languageChanged') {
    const newLanguage = request.language;
    // Recarregar traduções
  }
});
```

## 🎨 Boas Práticas

### 1. Chaves Descritivas
```javascript
// ❌ Evite
t('msg1')

// ✅ Prefira
t('popup.entries.empty')
```

### 2. Pluralização (Futuro)
```javascript
// Para implementar no futuro
entries: {
  count: '{count} entrada | {count} entradas'
}
```

### 3. Contexto
```javascript
// Adicione contexto quando necessário
button: {
  select: 'Selecionar Botão na Página', // Contexto: onde selecionar
  clear: 'Limpar Seleção' // Contexto: limpar o quê
}
```

### 4. Formatação de Data
```javascript
// Use locale do navegador
const locale = i18n.getCurrentLanguage() === 'pt-BR' ? 'pt-BR' : 
               i18n.getCurrentLanguage() === 'en-US' ? 'en-US' : 'es-ES';
               
date.toLocaleDateString(locale, options);
```

## 🧪 Testar Traduções

### Teste Manual

1. Abra o popup
2. Troque o idioma no seletor
3. Verifique se todos os textos foram traduzidos
4. Teste funcionalidades (adicionar entrada, configurar botão, etc.)
5. Recarregue a extensão e verifique se idioma persiste

### Teste de Fallback

```javascript
// Se tradução não existir, retorna a chave
const text = i18n.t('inexistent.key'); // Retorna: 'inexistent.key'
```

### Console de Debug

```javascript
// Ver todas as traduções do idioma atual
console.log(i18n.getAll());

// Ver idioma atual
console.log(i18n.getCurrentLanguage()); // 'pt-BR'

// Listar idiomas disponíveis
console.log(i18n.getAvailableLanguages());
// [
//   { code: 'pt-BR', name: 'Português (Brasil)' },
//   { code: 'en-US', name: 'English (USA)' },
//   { code: 'es', name: 'Español' }
// ]
```

## 🚀 Próximos Passos

### Funcionalidades Futuras

1. **Auto-detect do idioma do navegador**
   ```javascript
   const browserLang = navigator.language; // 'pt-BR', 'en-US', etc.
   ```

2. **Pluralização inteligente**
   ```javascript
   t('entries.count', { count: 1 }); // "1 entrada"
   t('entries.count', { count: 5 }); // "5 entradas"
   ```

3. **Formatação de números e moedas**
   ```javascript
   i18n.formatNumber(1234.56); // "1.234,56" (pt-BR) ou "1,234.56" (en-US)
   ```

4. **RTL Support** (para idiomas da direita para esquerda)

## 📚 Referências

- **Idiomas atuais**: pt-BR, en-US, es
- **Idioma padrão**: pt-BR
- **Storage key**: `selectedLanguage`
- **Total de traduções**: ~60+ strings

---

**Versão**: 2.0.0
**Última atualização**: 2026-01-25

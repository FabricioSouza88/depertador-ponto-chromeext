# 👨‍💻 Guia do Desenvolvedor

Documentação técnica para desenvolvedores que querem entender ou contribuir com o código.

## 🏗️ Arquitetura

### Manifest V3
A extensão usa **Manifest V3**, a versão mais recente do Chrome Extensions API, que traz:
- Service Workers em vez de background pages
- Melhor segurança e performance
- Permissões mais granulares

### Componentes Principais

```
┌─────────────────────────────────────────────┐
│              CHROME BROWSER                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐      ┌────────────────┐  │
│  │   POPUP      │      │   BACKGROUND   │  │
│  │  (popup.js)  │◄────►│  (background.js│  │
│  │              │      │  Service Worker│  │
│  └──────────────┘      └────────────────┘  │
│         ▲                       ▲           │
│         │                       │           │
│         │                       │           │
│         ▼                       ▼           │
│  ┌──────────────────────────────────────┐  │
│  │      CHROME STORAGE API              │  │
│  │  (chrome.storage.local)              │  │
│  └──────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   AHGORA PAGE (content.js)           │  │
│  │   https://app.ahgora.com.br/         │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## 📁 Estrutura de Arquivos

### manifest.json
Arquivo de configuração principal da extensão.

**Permissões:**
- `storage`: Salvar dados localmente
- `alarms`: Criar notificações programadas
- `notifications`: Mostrar alertas do sistema
- `host_permissions`: Acessar página do Ahgora

### popup.html/css/js
Interface do usuário que aparece ao clicar no ícone.

**Classes principais:**
- `StorageManager`: Gerencia leitura/escrita no chrome.storage
- `TimeCalculator`: Calcula horários e diferenças
- `UIManager`: Controla toda a interface

**Fluxo:**
1. DOMContentLoaded → UIManager.init()
2. Carrega dados do storage
3. Renderiza interface
4. Atualiza a cada 60 segundos

### content.js
Script injetado na página do Ahgora.

**Classe principal:**
- `ClickDetector`: Detecta e processa cliques no botão de ponto

**Estratégia de detecção:**
1. MutationObserver monitora o DOM
2. Múltiplos seletores tentam encontrar o botão
3. Event listeners capturam clicks
4. Debounce evita duplicatas
5. Salva no storage e notifica background

**Seletores usados:**
```javascript
'button.MuiButtonBase-root.MuiButton-root.MuiButton-text.jss83'
'button.MuiButton-root[type="button"]'
// + buscas por texto "Clocking in"
```

### background.js
Service Worker que roda em background.

**Classe principal:**
- `AlarmManager`: Gerencia alarmes e notificações

**Funcionalidades:**
- Cria alarmes para horário de saída
- Envia notificações programadas (15min, 5min, na hora)
- Reseta à meia-noite
- Responde mensagens de popup e content script

**API de Alarmes:**
```javascript
chrome.alarms.create(name, {
  when: timestamp,           // timestamp absoluto
  delayInMinutes: X,        // ou delay relativo
  periodInMinutes: Y        // ou intervalo periódico
});
```

## 💾 Estrutura de Dados

### Storage Keys

```javascript
// Entradas de um dia específico
"entries_YYYY-MM-DD": [
  {
    timestamp: 1705308000000,  // Unix timestamp
    source: "auto" | "manual"  // Como foi registrado
  },
  // ...mais entradas
]

// Configurações do usuário
"settings": {
  workHours: 8,      // float
  breakMinutes: 60   // int
}

// Info do alarme ativo
"alarmInfo": {
  exitTime: 1705335600000,
  entries: 3,
  settings: { workHours: 8, breakMinutes: 60 }
}
```

## 🔄 Fluxos de Dados

### 1. Registro de Ponto Automático

```
Usuário clica no botão (Ahgora)
    ↓
content.js detecta o click
    ↓
Salva no chrome.storage.local
    ↓
Envia mensagem para background.js
    ↓
background.js cria alarme
    ↓
Mostra notificação de confirmação
```

### 2. Entrada Manual

```
Usuário insere horário no popup
    ↓
popup.js valida
    ↓
Salva no chrome.storage.local
    ↓
Envia mensagem para background.js
    ↓
background.js atualiza alarme
    ↓
popup.js recarrega UI
```

### 3. Notificação de Saída

```
Alarme dispara no horário programado
    ↓
background.js recebe evento
    ↓
chrome.notifications.create()
    ↓
Usuário vê notificação
    ↓
Usuário clica em botão/notificação
    ↓
background.js processa ação
```

## 🎨 Padrões de Código

### Classes e Módulos
- Usamos classes ES6 para organização
- Métodos estáticos para utilitários
- Métodos de instância para estado

### Nomenclatura
- Classes: `PascalCase`
- Métodos/funções: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Arquivos: `kebab-case.js`

### Async/Await
Preferimos async/await sobre callbacks:

```javascript
// ❌ Evitar
chrome.storage.local.get(['key'], (result) => {
  // callback hell
});

// ✅ Preferir
const result = await StorageHelper.get('key');
```

### Error Handling
Sempre trate erros:

```javascript
try {
  await someAsyncOperation();
} catch (error) {
  console.error('❌ [Component] Error:', error);
  // Feedback ao usuário se necessário
}
```

## 🔧 APIs Importantes

### Chrome Storage API
```javascript
// Set
chrome.storage.local.set({ key: value });

// Get
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});

// Clear
chrome.storage.local.clear();
```

### Chrome Alarms API
```javascript
// Create
chrome.alarms.create('name', { when: Date.now() + 60000 });

// Listen
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name);
});

// Get all
chrome.alarms.getAll((alarms) => console.log(alarms));
```

### Chrome Notifications API
```javascript
chrome.notifications.create('id', {
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Title',
  message: 'Message',
  buttons: [{ title: 'Button' }]
});
```

### Chrome Runtime Messaging
```javascript
// Send
chrome.runtime.sendMessage({ action: 'updateAlarm' });

// Receive
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateAlarm') {
    // handle
    sendResponse({ success: true });
  }
  return true; // Mantém canal aberto para async
});
```

## 🐛 Debug

### Logs
Todos os logs são prefixados para fácil filtragem:
```javascript
console.log('🚀 [Despertador Ponto] Mensagem');
console.log('✅ [Background] Alarme criado');
console.log('❌ [Content] Erro ao detectar');
```

### DevTools
- **Popup**: Botão direito no popup > Inspecionar
- **Background**: chrome://extensions/ > Inspecionar visualizações
- **Content**: F12 na página do Ahgora

### Chrome APIs Debug
```javascript
// Ver extensões instaladas
chrome.management.getAll(console.log)

// Ver alarmes
chrome.alarms.getAll(console.log)

// Ver storage
chrome.storage.local.get(null, console.log)
```

## 🧪 Testes

Atualmente não há testes automatizados, mas você pode:

1. **Testes Manuais**: Veja `TEST_EXTENSION.md`
2. **Console Testing**: Use snippets do Chrome DevTools
3. **Mock Data**: Crie dados de teste via console

### Exemplo de Teste no Console
```javascript
// No popup DevTools
async function testCalculation() {
  const entry = new Date();
  entry.setHours(8, 0, 0, 0);
  
  await StorageManager.addEntry(entry.getTime(), 'manual');
  
  const settings = { workHours: 8, breakMinutes: 60 };
  const exitTime = TimeCalculator.calculateExitTime(
    [{ timestamp: entry.getTime() }], 
    settings
  );
  
  console.log('Exit time:', TimeCalculator.formatTime(exitTime));
}

testCalculation();
```

## 📝 Convenções de Commit

Sugestão de formato:
```
tipo(escopo): descrição curta

Descrição mais longa se necessário

Tipos: feat, fix, docs, style, refactor, test, chore
Escopos: popup, content, background, storage, ui
```

Exemplos:
```
feat(content): adiciona detecção de novo botão
fix(popup): corrige cálculo de horas
docs(readme): atualiza guia de instalação
```

## 🚀 Build e Deploy

### Desenvolvimento
1. Faça alterações nos arquivos
2. Vá em `chrome://extensions/`
3. Clique em "Recarregar" na extensão
4. Teste as mudanças

### Produção
Para publicar na Chrome Web Store:

1. **Prepare o pacote:**
```bash
# Remova arquivos desnecessários
# Gere ícones finais de alta qualidade
npm install
npm run generate-icons
```

2. **Crie o .zip:**
```bash
# Exclua:
# - node_modules/
# - .git/
# - arquivos de dev (.ps1, .py auxiliares)
```

3. **Publique:**
- Acesse: https://chrome.google.com/webstore/devconsole
- Upload do .zip
- Preencha informações
- Aguarde revisão (1-3 dias)

## 🔐 Segurança

### Permissões Mínimas
Solicitamos apenas o necessário:
- `storage`: Salvar dados localmente
- `alarms`: Notificações programadas
- `notifications`: Alertas do sistema
- `host_permissions`: Apenas app.ahgora.com.br

### Content Security Policy
Manifest V3 é mais restritivo:
- Não permite eval()
- Não permite inline scripts
- Tudo deve ser em arquivos externos

### Dados do Usuário
- Salvos apenas localmente (chrome.storage.local)
- Não enviados para servidores externos
- Não coletamos analytics
- Usuário pode limpar a qualquer momento

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'feat: adiciona X'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Checklist do PR
- [ ] Código segue os padrões do projeto
- [ ] Funcionalidade foi testada manualmente
- [ ] Documentação foi atualizada
- [ ] Não há erros no console
- [ ] CHANGELOG.md foi atualizado

## 📚 Recursos

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Alarms API](https://developer.chrome.com/docs/extensions/reference/alarms/)
- [Chrome Notifications API](https://developer.chrome.com/docs/extensions/reference/notifications/)

## 💡 Dicas

1. **Hot Reload**: Use Ctrl+R no popup para recarregar
2. **Preserve Logs**: Ative no DevTools para manter logs ao recarregar
3. **Breakpoints**: Use debugger; no código para parar execução
4. **Network Tab**: Útil para debug do content script
5. **Console Filters**: Use os prefixos ([Despertador Ponto], etc)

---

**Happy Coding! 🚀**

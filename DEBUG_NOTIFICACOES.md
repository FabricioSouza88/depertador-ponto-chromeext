# 🔍 Debug de Notificações - Guia Detalhado

## Problema Reportado
- Alarme `periodic-check` dispara
- Função `checkUpcomingExit()` não executa ou não notifica
- Nenhuma notificação aparece

## 🆕 Logs Adicionados (Versão 1.0.2)

Agora o sistema tem logs muito mais detalhados para identificar exatamente onde está o problema:

```javascript
⏰ [Background] Alarme disparado: periodic-check
🔍 [Background] Executando verificação periódica
🔄 [Background] checkUpcomingExit() chamada
📦 [Background] alarmInfo: { exitTime: ..., entries: ..., settings: ... }
🔍 [Background] Verificando: faltam 15 minutos
📢 [Background] Enviando notificação de 15 minutos
🔔 [Background] showWarningNotification() chamada para 15 minutos
📢 [Background] Criando notificação ID: warning-1705335600000
✅ [Background] Notificação criada com sucesso: warning-1705335600000
```

## 📋 Teste Passo-a-Passo

### 1️⃣ Recarregar Extensão
```
chrome://extensions/ → Recarregar extensão
```

### 2️⃣ Limpar Storage (Importante!)
```
No Service Worker console:
chrome.storage.local.clear()
```

### 3️⃣ Abrir Popup e Adicionar Entrada
```
1. Clique no ícone da extensão
2. Adicione entrada MANUAL:
   - Se agora são 15:30, adicione 15:14 (16 min atrás)
3. Configure:
   - Horas: 8
   - Intervalo: 60
   - Clique em SALVAR
```

### 4️⃣ Monitorar Service Worker
```
chrome://extensions/ → service worker (link azul)

Logs esperados:
🔔 [Background] Atualizando alarme...
✅ [Background] Alarme configurado para XX:XX:XX
🔄 [Background] Criando periodic-check inicial
```

### 5️⃣ Aguardar e Observar Logs

**A cada 1 minuto** você deve ver:

```
⏰ [Background] Alarme disparado: periodic-check
🔍 [Background] Executando verificação periódica
🔄 [Background] checkUpcomingExit() chamada
📦 [Background] alarmInfo: {...}
🔍 [Background] Verificando: faltam XX minutos
```

**Quando chegar em 14-16 minutos:**

```
🔍 [Background] Verificando: faltam 15 minutos
📢 [Background] Enviando notificação de 15 minutos
🔔 [Background] showWarningNotification() chamada para 15 minutos
📢 [Background] Criando notificação ID: warning-XXXXX
✅ [Background] Notificação criada com sucesso: warning-XXXXX
```

## 🔍 Diagnóstico por Logs

### Cenário 1: Não aparece "🔍 Executando verificação periódica"
**Problema:** Listener não está funcionando  
**Solução:** 
```javascript
// Execute no console:
chrome.alarms.getAll(console.log)
// Deve mostrar: periodic-check
```

### Cenário 2: Aparece "⚠️ Sem alarmInfo"
**Problema:** Entrada não foi salva corretamente  
**Solução:**
```javascript
// Execute no console:
chrome.storage.local.get('alarmInfo', console.log)
// Deve retornar objeto com exitTime
```

### Cenário 3: Aparece "❌ Erro ao criar notificação"
**Problema:** Permissões do Chrome  
**Solução:**
1. Configurações Windows > Notificações
2. Ativar Google Chrome
3. Desativar "Modo Não Perturbe"

### Cenário 4: Logs OK mas notificação não aparece
**Problema:** Sistema operacional bloqueando  
**Testes:**
```javascript
// Teste manual no console:
chrome.notifications.create('test123', {
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: 'Teste Manual',
  message: 'Se você ver isso, notificações funcionam!',
  priority: 2,
  requireInteraction: true
}, (id) => {
  console.log('Notificação criada:', id);
});
```

Se esse teste manual funcionar mas a extensão não = problema na lógica  
Se esse teste manual não funcionar = problema no sistema

## 🎯 Comandos de Debug Úteis

### Ver Storage Completo
```javascript
chrome.storage.local.get(null, (data) => {
  console.log('Storage completo:', JSON.stringify(data, null, 2));
});
```

### Ver Alarmes Ativos
```javascript
chrome.alarms.getAll((alarms) => {
  alarms.forEach(a => {
    console.log(`Alarme: ${a.name}`);
    if (a.scheduledTime) {
      console.log(`  Dispara em: ${new Date(a.scheduledTime).toLocaleString()}`);
    }
    if (a.periodInMinutes) {
      console.log(`  Período: ${a.periodInMinutes} minutos`);
    }
  });
});
```

### Forçar Verificação Imediata
```javascript
// No console do Service Worker:
(async function() {
  const alarmInfo = await new Promise(resolve => {
    chrome.storage.local.get('alarmInfo', (data) => resolve(data.alarmInfo));
  });
  
  if (!alarmInfo) {
    console.log('❌ Sem alarmInfo');
    return;
  }
  
  const exitTime = new Date(alarmInfo.exitTime);
  const now = new Date();
  const minutesRemaining = Math.round((exitTime - now) / (1000 * 60));
  
  console.log('exitTime:', exitTime.toLocaleString());
  console.log('now:', now.toLocaleString());
  console.log('minutesRemaining:', minutesRemaining);
  
  if (minutesRemaining >= 14 && minutesRemaining <= 16) {
    console.log('✅ Dentro do range! Deveria notificar.');
  } else {
    console.log('❌ Fora do range.');
  }
})();
```

### Testar Notificação Diretamente
```javascript
chrome.notifications.create('test-warning', {
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: '⚠️ Atenção - Ponto em breve',
  message: 'Faltam 15 minutos para o horário de saída!',
  priority: 1
}, (id) => {
  if (chrome.runtime.lastError) {
    console.error('Erro:', chrome.runtime.lastError);
  } else {
    console.log('Notificação criada:', id);
  }
});
```

## 📱 Sobre "Funciona em Qualquer Tela?"

### ✅ SIM - Notificações Funcionam em Qualquer Lugar

As notificações do Chrome são **notificações do sistema**, não da página web:

- ✅ Funciona com Chrome minimizado
- ✅ Funciona em tela cheia (jogos, vídeos)
- ✅ Funciona com outras janelas ativas
- ✅ Funciona com PC bloqueado (se configurado)
- ✅ Aparece na Central de Ações do Windows

### ⚙️ Configurações Necessárias

**Windows 11/10:**
```
Configurações > Sistema > Notificações
  ↳ Notificações = ATIVADO
  ↳ Google Chrome = ATIVADO
  ↳ Modo Não Perturbe = DESATIVADO
  ↳ Assistente de Foco = DESATIVADO
```

**Chrome:**
```
chrome://settings/content/notifications
  ↳ Sites podem pedir para enviar notificações = ATIVADO
```

### 🔔 Tipos de Notificação

**Notificação de Aviso (15min, 5min):**
- Prioridade: Normal (1)
- Som: Padrão do sistema
- Desaparece após alguns segundos
- Fica na Central de Ações

**Notificação Principal (hora de sair):**
- Prioridade: Alta (2)
- Som: Padrão do sistema
- `requireInteraction: true` = Não desaparece sozinha
- Botões interativos
- Fica visível até você clicar

## 🎬 Fluxo Completo Esperado

```
T=0min:   Usuário adiciona entrada
          ↓
          🔔 Atualizando alarme...
          ✅ Alarme configurado
          🔄 Criando periodic-check inicial

T=1min:   ⏰ Alarme periodic-check dispara
          🔍 Executando verificação
          🔄 checkUpcomingExit() chamada
          📦 alarmInfo encontrado
          🔍 Verificando: faltam 16 minutos
          (nada acontece, aguarda)

T=2min:   (repete verificação)
          🔍 Verificando: faltam 15 minutos
          📢 Enviando notificação de 15 minutos
          🔔 showWarningNotification() chamada
          📢 Criando notificação
          ✅ Notificação criada com sucesso
          → NOTIFICAÇÃO APARECE NA TELA 🎉

T=3min:   (repete verificação)
          🔍 Verificando: faltam 14 minutos
          (flag já está true, não notifica)

...continua verificando a cada minuto
```

## 🐛 Se Ainda Não Funcionar

1. **Copie TODOS os logs do console**
2. **Execute os comandos de debug acima**
3. **Tire prints das configurações de notificação**
4. **Teste a notificação manual**
5. **Informe os resultados**

## 📝 Checklist Final

- [ ] Extensão recarregada
- [ ] Storage limpo
- [ ] Entrada manual adicionada
- [ ] Console do Service Worker aberto
- [ ] Alarme periodic-check aparece nos logs
- [ ] alarmInfo tem exitTime
- [ ] minutesRemaining está correto
- [ ] Logs de "Enviando notificação" aparecem
- [ ] Logs de "Notificação criada com sucesso" aparecem
- [ ] Notificação manual funciona
- [ ] Permissões Windows OK

---

**Agora teste e me envie os logs que aparecem!** 📋

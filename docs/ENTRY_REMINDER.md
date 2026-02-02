# ⏰ Lembrete de Entrada Habitual

Esta documentação descreve a funcionalidade de lembrete automático para batida de ponto de entrada.

## 📋 O Que É

O Lembrete de Entrada Habitual é uma funcionalidade que avisa o usuário quando ele esquece de bater o ponto de entrada no horário habitual.

## 🎯 Como Funciona

### 1. Configuração

O usuário define seu **horário habitual de entrada** nas configurações:

```
Configurações → Horário de Entrada Habitual: 08:00
```

**Valor padrão**: 08:00

### 2. Verificação Automática

A extensão verifica periodicamente (a cada minuto) se:

1. ✅ O usuário configurou um horário de entrada habitual
2. ✅ Já passou **5 minutos** do horário configurado
3. ✅ **Não há nenhuma entrada** registrada hoje
4. ✅ O lembrete **ainda não foi enviado** hoje

### 3. Notificação

Se todas as condições acima forem atendidas, uma **notificação** é exibida:

**PT-BR**:
```
🔔 Hora de bater o ponto! ⏰
Você ainda não registrou sua entrada de hoje. 
Não esqueça de bater o ponto!
```

**EN-US**:
```
🔔 Time to clock in! ⏰
You haven't clocked in yet today. 
Don't forget to punch in!
```

**ES**:
```
🔔 ¡Hora de fichar! ⏰
Aún no ha registrado su entrada de hoy. 
¡No olvide fichar!
```

### 4. Comportamento

- **Uma vez por dia**: O lembrete só é enviado **uma vez** por dia
- **Reseta ao salvar**: Se você alterar as configurações, o sistema permite enviar novamente (caso ainda não tenha entrada)
- **Reseta à meia-noite**: A cada novo dia, o contador é resetado

## 🔧 Implementação Técnica

### Arquivos Modificados

1. **Traduções** (`src/locales/*.js`):
   - `settings.usualEntryTime`: Label do campo
   - `settings.usualEntryTimeTooltip`: Tooltip explicativo
   - `notifications.entryReminder.title`: Título da notificação
   - `notifications.entryReminder.message`: Mensagem da notificação

2. **HTML** (`popup.html`):
   ```html
   <input type="time" id="usual-entry-time" value="08:00" />
   ```

3. **JavaScript** (`popup-i18n.js`):
   - Campo adicionado no `UIManager.elements`
   - Salva/carrega `usualEntryTime` nas configurações
   - Envia mensagem `settings-updated` ao background

4. **Background** (`background.js`):
   - Nova constante: `CONFIG.entryReminderDelay = 5`
   - Nova função: `AlarmManager.checkAndRemindEntry()`
   - Nova função: `AlarmManager.showEntryReminder()`
   - Chamada em `periodic-check` alarm
   - Listener para mensagem `settings-updated`

### Fluxo de Execução

```
┌─────────────────────────────────────┐
│ 1. Usuário configura horário (8:00)│
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Background: Verificação periódica│
│    (a cada minuto via periodic-check│
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. checkAndRemindEntry()            │
│    - Verifica hora atual            │
│    - Verifica se passou 5min (8:05) │
│    - Verifica se tem entrada hoje   │
│    - Verifica se já enviou lembrete │
└────────────┬────────────────────────┘
             │
             ▼ (Se todas condições OK)
┌─────────────────────────────────────┐
│ 4. showEntryReminder()              │
│    - Obtém idioma do usuário        │
│    - Cria notificação traduzida     │
│    - Salva flag de lembrete enviado │
└─────────────────────────────────────┘
```

### Storage Keys

```javascript
// Configurações do usuário
'settings': {
  workHours: 8,
  breakMinutes: 60,
  usualEntryTime: '08:00'  // <-- NOVO
}

// Flag de lembrete enviado (por dia)
'entry-reminder-sent-entries_2026-01-26': true

// Entradas do dia
'entries_2026-01-26': [
  { timestamp: 1706342400000, source: 'automatic' }
]
```

## 🎯 Casos de Uso

### Cenário 1: Usuário Esqueceu

```
Horário configurado: 08:00
Hora atual: 08:07
Entradas hoje: []

Resultado: 🔔 Notificação enviada
```

### Cenário 2: Usuário Já Bateu

```
Horário configurado: 08:00
Hora atual: 08:07
Entradas hoje: [08:05]

Resultado: ⏭️ Nenhuma ação (já tem entrada)
```

### Cenário 3: Ainda Não Passou Tempo

```
Horário configurado: 08:00
Hora atual: 08:03
Entradas hoje: []

Resultado: ⏭️ Nenhuma ação (ainda faltam 2min)
```

### Cenário 4: Lembrete Já Enviado

```
Horário configurado: 08:00
Hora atual: 08:30
Entradas hoje: []
Lembrete enviado: true

Resultado: ⏭️ Nenhuma ação (já enviou hoje)
```

## ⚙️ Configurações

### Alterar Delay do Lembrete

No arquivo `background.js`:

```javascript
const CONFIG = {
  entryReminderDelay: 5  // Alterar para 10, 15, etc (em minutos)
};
```

### Desabilitar Funcionalidade

O usuário pode simplesmente **não configurar** o horário de entrada, ou deixar vazio. Neste caso, a verificação é pulada automaticamente.

## 🧪 Como Testar

### Teste 1: Lembrete Aparece

1. Configure horário de entrada para **5 minutos no passado**
   - Ex: Se agora são 14:30, configure para 14:25
2. Certifique-se de **não ter entradas** hoje
3. Aguarde até **14:30** (5min após o horário)
4. ✅ **Esperado**: Notificação deve aparecer

### Teste 2: Lembrete Não Aparece (Já Bateu)

1. Configure horário de entrada: 08:00
2. **Adicione uma entrada manual** de hoje
3. ✅ **Esperado**: Notificação NÃO aparece

### Teste 3: Tradução

1. Mude o idioma para Inglês
2. Force a notificação (horário no passado + sem entradas)
3. ✅ **Esperado**: Notificação em inglês

### Teste 4: Reset de Flag

1. Receba a notificação
2. Altere alguma configuração e salve
3. Remova todas as entradas
4. ✅ **Esperado**: Notificação pode aparecer novamente

## 🐛 Troubleshooting

### Notificação Não Aparece

**Causas possíveis**:

1. **Horário não configurado**
   - Verifique se `usualEntryTime` está definido nas configurações

2. **Ainda não passou 5 minutos**
   - Aguarde passar os 5 minutos do horário configurado

3. **Já tem entrada hoje**
   - Abra o popup e verifique se há entradas registradas

4. **Lembrete já enviado**
   - Só envia uma vez por dia. Teste em um novo dia ou resete via DevTools:
   ```javascript
   const today = new Date().toISOString().split('T')[0].replace(/-/g, '-');
   const key = `entry-reminder-sent-entries_${today}`;
   chrome.storage.local.remove([key]);
   ```

5. **Notificações bloqueadas**
   - Verifique permissões do Chrome
   - Configurações → Notificações → Chrome

### Debug

Abra o Service Worker Console:

1. `chrome://extensions/`
2. Encontre "Despertador Ponto"
3. Clique em "Service Worker" (link azul)
4. Veja os logs:

```
🔍 [Background] Verificando necessidade de lembrete de entrada
⏰ [Background] Horário habitual: 08:00, Diferença: 7 minutos
🔔 [Background] Enviando lembrete de entrada
✅ [Background] Lembrete de entrada enviado
```

## 📊 Estatísticas

- **Verificações**: A cada 1 minuto (via periodic-check)
- **Delay**: 5 minutos após horário configurado
- **Frequência**: 1 vez por dia por usuário
- **Idiomas**: Português, Inglês, Espanhol

## 🔄 Versão

- **Adicionado em**: v2.2.0
- **Última atualização**: Janeiro 2026

---

**Funcionalidade implementada com sucesso!** ⏰✨

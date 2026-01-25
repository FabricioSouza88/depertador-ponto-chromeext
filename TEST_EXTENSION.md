# 🧪 Guia de Testes da Extensão

Este guia ajuda você a testar todas as funcionalidades da extensão.

## ✅ Checklist de Testes

### 1. Instalação ✓
- [ ] A extensão carrega sem erros no Chrome
- [ ] O ícone aparece na barra de ferramentas
- [ ] Não há erros no console de extensões (`chrome://extensions/`)

### 2. Interface do Popup ✓
- [ ] Popup abre ao clicar no ícone
- [ ] Data atual é exibida corretamente
- [ ] Interface está responsiva e bonita
- [ ] Todos os botões são visíveis

### 3. Entrada Manual ✓
- [ ] Campo de horário aceita entrada
- [ ] Botão "Adicionar" funciona
- [ ] Entrada aparece na lista
- [ ] Horário de saída é calculado
- [ ] Notificação de sucesso é exibida

### 4. Remover Entrada ✓
- [ ] Botão "Remover" aparece em cada entrada
- [ ] Remoção funciona corretamente
- [ ] Horário de saída é recalculado
- [ ] Lista é atualizada

### 5. Configurações ✓
- [ ] Campos de horas e minutos aceitam entrada
- [ ] Botão "Salvar" funciona
- [ ] Configurações são persistidas (feche e abra o popup)
- [ ] Cálculos são atualizados com novas configurações

### 6. Detecção Automática (Ahgora) ✓
- [ ] Acesse: https://app.ahgora.com.br/novabatidaonline/
- [ ] O indicador visual aparece no botão (⏰)
- [ ] Clique no botão de ponto é detectado
- [ ] Feedback visual aparece na página
- [ ] Entrada é registrada automaticamente
- [ ] Popup mostra a nova entrada como "Automático"

### 7. Cálculos ✓
- [ ] Horário de saída é calculado corretamente
- [ ] Tempo restante é exibido
- [ ] Barra de progresso funciona
- [ ] Valores atualizam em tempo real

### 8. Notificações (Requer esperar) ⏰
- [ ] Notificação 15min antes (configure um horário de teste próximo)
- [ ] Notificação 5min antes
- [ ] Notificação na hora exata
- [ ] Botões da notificação funcionam
- [ ] Click na notificação abre o popup

### 9. Múltiplas Entradas ✓
- [ ] Adicione várias entradas no mesmo dia
- [ ] Todas aparecem na lista
- [ ] Cálculo usa a primeira entrada
- [ ] Contador de entradas está correto

### 10. Persistência ✓
- [ ] Dados persistem ao fechar e abrir o popup
- [ ] Dados persistem ao fechar e abrir o navegador
- [ ] Limpeza à meia-noite funciona (pode ser difícil testar)

### 11. Botão "Limpar Registros" ✓
- [ ] Confirmação é solicitada
- [ ] Todos os registros são removidos
- [ ] Interface volta ao estado inicial

### 12. Erros e Edge Cases ✓
- [ ] Adicionar entrada sem selecionar horário mostra erro
- [ ] Página do Ahgora sem o botão não quebra a extensão
- [ ] Funciona com múltiplas abas abertas

## 🐛 Como Fazer Debug

### Popup
```javascript
// Abra DevTools do popup (botão direito > Inspecionar)
// Console commands úteis:

// Ver todos os dados salvos
chrome.storage.local.get(null, console.log)

// Ver entradas de hoje
chrome.storage.local.get(['entries_2026-01-15'], console.log)

// Ver configurações
chrome.storage.local.get(['settings'], console.log)

// Limpar tudo (reset)
chrome.storage.local.clear()
```

### Background Service Worker
```javascript
// Em chrome://extensions/ > Detalhes > Inspecionar visualizações

// Ver alarmes ativos
chrome.alarms.getAll(console.log)

// Criar alarme de teste (1 minuto)
chrome.alarms.create('test', { delayInMinutes: 1 })
```

### Content Script
```javascript
// F12 na página do Ahgora
// Procure por logs com [Despertador Ponto]

// Verificar se content script foi injetado
console.log('Content scripts:', window.location.href)
```

## 🧪 Testes Automatizados (Opcional)

Para desenvolvedores que querem ir além:

```javascript
// Criar entradas de teste rapidamente
async function createTestEntries() {
  const today = new Date();
  const key = `entries_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const entries = [
    { timestamp: new Date('2026-01-15 08:00:00').getTime(), source: 'manual' },
    { timestamp: new Date('2026-01-15 12:00:00').getTime(), source: 'auto' },
    { timestamp: new Date('2026-01-15 13:00:00').getTime(), source: 'auto' },
  ];
  
  await chrome.storage.local.set({ [key]: entries });
  console.log('Entradas de teste criadas!');
}
```

## ✨ Dicas de Teste

1. **Teste Rápido de Notificações**: Configure 1 hora de trabalho e 0 de intervalo, adicione uma entrada 55 minutos atrás

2. **Reset Completo**: 
   - Vá em `chrome://extensions/`
   - Remova a extensão
   - Recarregue

3. **Testar em Incógnito**: 
   - Extensões não funcionam em incógnito por padrão
   - Ative em Detalhes > "Permitir no modo anônimo"

4. **Verificar Logs**:
   - Popup: Botão direito > Inspecionar
   - Background: chrome://extensions/ > Inspecionar
   - Content: F12 na página

## 📊 Cenários de Teste Avançados

### Cenário 1: Dia Normal
1. Adicione entrada às 08:00 (manual)
2. Configure 8h trabalho + 1h intervalo
3. Verifique que saída = 17:00
4. Aguarde notificações

### Cenário 2: Múltiplas Batidas
1. Adicione entrada às 08:00
2. Adicione entrada às 12:00
3. Adicione entrada às 13:00
4. Adicione entrada às 14:00
5. Verifique que o cálculo usa a primeira (08:00)

### Cenário 3: Mudança de Configuração
1. Adicione entrada às 09:00
2. Configure 8h + 1h = saída 18:00
3. Mude para 6h + 0h = saída 15:00
4. Verifique atualização

### Cenário 4: Detecção Automática
1. Abra página do Ahgora
2. Veja indicador visual
3. Clique no botão de ponto
4. Veja feedback
5. Abra popup e confirme registro

## 🎯 Critérios de Aceitação

A extensão está pronta quando:
- ✅ Todos os itens do checklist passam
- ✅ Não há erros no console
- ✅ Interface é intuitiva
- ✅ Notificações funcionam
- ✅ Integração com Ahgora funciona
- ✅ Dados persistem corretamente

---

**Encontrou um bug?** Abra uma issue ou corrija você mesmo! 🐛🔧

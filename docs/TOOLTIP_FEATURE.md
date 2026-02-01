# 💡 Funcionalidade de Tooltip de Ajuda

Esta documentação descreve a implementação do ícone de ajuda (?) com tooltip na seção "Botão de Ponto".

## 📋 Implementação

### 1. Traduções (i18n)

Adicionadas traduções em 3 idiomas:

**Português (PT-BR)**:
```
"Configure o botão de ponto do seu sistema online. Clique em 'Selecionar Botão' e depois clique no botão de ponto na página do seu sistema. A extensão detectará automaticamente quando você bater o ponto."
```

**Inglês (EN-US)**:
```
"Configure your time tracking system button. Click 'Select Button' and then click the clock button on your system's page. The extension will automatically detect when you clock in or out."
```

**Espanhol (ES)**:
```
"Configure el botón de fichaje de su sistema online. Haga clic en 'Seleccionar Botón' y luego haga clic en el botón de fichaje en la página de su sistema. La extensión detectará automáticamente cuando registre entrada o salida."
```

### 2. HTML

```html
<h2>
  🎯 <span data-i18n="popup.button.title">Botão de Ponto</span>
  <span class="help-icon" data-tooltip data-i18n-tooltip="popup.button.tooltip">?</span>
</h2>
```

**Atributos**:
- `class="help-icon"`: Estilo do ícone
- `data-tooltip`: Marcador para indicar que tem tooltip
- `data-i18n-tooltip`: Chave de tradução do tooltip
- Conteúdo: `?` (interrogação)

### 3. CSS

**Ícone**:
```css
.help-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  cursor: help;
}
```

**Tooltip**:
```css
.help-icon[data-tooltip]::after {
  content: attr(data-tooltip-text);
  position: absolute;
  bottom: 100%;
  background: rgba(44, 62, 80, 0.95);
  color: white;
  padding: 12px 16px;
  width: 280px;
  opacity: 0;
}

.help-icon[data-tooltip]:hover::after {
  opacity: 1;
}
```

**Seta**:
```css
.help-icon[data-tooltip]::before {
  content: '';
  border: 6px solid transparent;
  border-top-color: rgba(44, 62, 80, 0.95);
}
```

### 4. JavaScript (popup-i18n.js)

```javascript
applyTranslations() {
  // ... tradução de elementos normais ...
  
  // Atualiza tooltips
  document.querySelectorAll('[data-i18n-tooltip]').forEach(element => {
    const key = element.getAttribute('data-i18n-tooltip');
    const translation = i18n.t(key);
    element.setAttribute('data-tooltip-text', translation);
  });
}
```

## 🎨 Design

### Visual
- **Cor de fundo**: #667eea (roxo da extensão)
- **Tamanho**: 18x18 pixels
- **Formato**: Círculo
- **Texto**: ? (branco)
- **Efeito hover**: Escala 1.1x

### Tooltip
- **Fundo**: rgba(44, 62, 80, 0.95) (cinza escuro semi-transparente)
- **Texto**: Branco
- **Largura**: 280px
- **Padding**: 12px 16px
- **Borda**: Arredondada (8px)
- **Sombra**: 0 4px 12px rgba(0, 0, 0, 0.3)
- **Animação**: Fade in/out (0.3s)
- **Posição**: Acima do ícone

### Seta
- **Tamanho**: 6px
- **Cor**: Mesma do fundo do tooltip
- **Posição**: Centro inferior do tooltip

## 🔧 Como Usar

### Para Adicionar Novo Tooltip

1. **Adicionar tradução** em `src/locales/*.js`:
```javascript
mySection: {
  tooltip: 'Texto explicativo aqui'
}
```

2. **Adicionar HTML**:
```html
<span class="help-icon" data-tooltip data-i18n-tooltip="mySection.tooltip">?</span>
```

3. **Pronto!** O JavaScript automaticamente:
   - Carrega a tradução correta
   - Aplica no atributo `data-tooltip-text`
   - CSS exibe o tooltip no hover

## 📱 Responsividade

- **Desktop**: Tooltip aparece acima do ícone
- **Largura máxima**: 90vw (adapta-se a telas pequenas)
- **Texto**: Quebra automaticamente (white-space: normal)

## ♿ Acessibilidade

- `cursor: help` indica que é um elemento de ajuda
- Texto descritivo completo no tooltip
- Contraste adequado (texto branco em fundo escuro)
- Animação suave (não abrupta)

## 🧪 Testado

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ✅ 3 idiomas (PT-BR, EN-US, ES)
- ✅ Hover funcional
- ✅ Mudança de idioma dinâmica

## 🎯 Benefícios

1. **Usuário entende rapidamente** para que serve a configuração
2. **Reduz confusão** sobre como usar a extensão
3. **Não polui a interface** (apenas aparece no hover)
4. **Multilíngue** (traduzido automaticamente)
5. **Fácil de expandir** para outras seções

## 📚 Arquivos Modificados

```
src/locales/pt-BR.js    ← Tradução PT
src/locales/en-US.js    ← Tradução EN
src/locales/es.js       ← Tradução ES
popup.html              ← HTML do ícone
popup.css               ← Estilos do tooltip
popup-i18n.js           ← Lógica de tradução
```

---

**Implementado com sucesso!** ✨

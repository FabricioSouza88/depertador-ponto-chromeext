# Exemplo de Módulo Refatorado

## 📝 SelectorGenerator - Exemplo Completo

Este documento mostra como um módulo refatorado deve ser estruturado.

### Arquivo: `src/content/SelectorGenerator.js`

## ✅ Boas Práticas Implementadas

### 1. **JSDoc Completo**
```javascript
/**
 * @module SelectorGenerator
 * @description Gera CSS selectors únicos e robustos para elementos DOM
 * 
 * @example
 * const selector = SelectorGenerator.generate(buttonElement);
 * // Returns: "#button-id" ou ".class1.class2"
 */
```

### 2. **Métodos Públicos Claros**
```javascript
export class SelectorGenerator {
  /**
   * Gera um selector CSS único para o elemento
   * @param {HTMLElement} element - Elemento DOM
   * @returns {string} CSS selector
   */
  static generate(element) { }
  
  /**
   * Valida se selector encontra o elemento
   * @param {string} selector
   * @param {HTMLElement} expectedElement
   * @returns {boolean}
   */
  static validate(selector, expectedElement) { }
}
```

### 3. **Métodos Privados**
```javascript
  /**
   * Tenta usar atributos estáveis
   * @private
   */
  static _tryStableAttributes(element) { }
  
  /**
   * Constrói path com classes
   * @private
   */
  static _buildClassPath(element) { }
```

Convenção: `_` prefix para métodos privados

### 4. **Responsabilidade Única**
- **Faz**: Gerar e validar selectors
- **NÃO faz**: UI, storage, logging

### 5. **Sem Dependências Externas**
- Usa apenas APIs nativas do browser
- Pode ser testado sem Chrome APIs
- Pure functions (sem estado)

### 6. **Testável**
```javascript
// test/SelectorGenerator.test.js
import { SelectorGenerator } from '../src/content/SelectorGenerator.js';

describe('SelectorGenerator', () => {
  test('should generate ID selector', () => {
    const button = document.createElement('button');
    button.id = 'my-button';
    document.body.appendChild(button);
    
    const selector = SelectorGenerator.generate(button);
    
    expect(selector).toBe('#my-button');
    expect(SelectorGenerator.validate(selector, button)).toBe(true);
  });
  
  test('should use data-testid', () => {
    const button = document.createElement('button');
    button.setAttribute('data-testid', 'clock-btn');
    document.body.appendChild(button);
    
    const selector = SelectorGenerator.generate(button);
    
    expect(selector).toBe('[data-testid="clock-btn"]');
  });
  
  test('should build class path', () => {
    const container = document.createElement('div');
    container.className = 'container';
    
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    container.appendChild(button);
    document.body.appendChild(container);
    
    const selector = SelectorGenerator.generate(button);
    
    expect(selector).toContain('button.btn');
    expect(SelectorGenerator.validate(selector, button)).toBe(true);
  });
});
```

## 🔄 Como Usar em Outros Módulos

### ElementPicker.js
```javascript
import { SelectorGenerator } from './SelectorGenerator.js';

export class ElementPicker {
  handleClick(e) {
    const element = e.target;
    
    // Gera selector
    const selector = SelectorGenerator.generate(element);
    
    // Valida
    if (SelectorGenerator.validate(selector, element)) {
      this.saveSelector(selector);
    } else {
      this.showError('Selector inválido');
    }
  }
}
```

### ClickDetector.js
```javascript
import { SelectorGenerator } from './SelectorGenerator.js';

export class ClickDetector {
  async findButton() {
    const config = await this.getConfig();
    
    // Usa selector configurado
    const button = document.querySelector(config.selector);
    
    return button;
  }
}
```

## 📐 Padrão para Todos os Módulos

### Template Base:

```javascript
/**
 * @module ModuleName
 * @description O que este módulo faz
 * 
 * @example
 * // Como usar
 */

import { necessaryImports } from '../path';

export class ModuleName {
  /**
   * Constructor se necessário
   */
  constructor() {
    this.property = value;
  }

  /**
   * Método público principal
   * @param {Type} param - Descrição
   * @returns {Type} Descrição
   */
  publicMethod(param) {
    // Implementação
  }

  /**
   * Método privado (helper)
   * @private
   */
  _privateMethod() {
    // Implementação
  }
}
```

### Checklist para Cada Módulo:

- [ ] JSDoc completo no topo
- [ ] Imports organizados
- [ ] Export da classe/funções
- [ ] Métodos privados com `_` prefix
- [ ] JSDoc em métodos públicos
- [ ] Parâmetros tipados
- [ ] Retornos documentados
- [ ] Exemplo de uso
- [ ] Error handling
- [ ] Zero dependências desnecessárias

## 🎨 Convenções de Código

### Imports:

```javascript
// 1. External/shared primeiro
import { CONFIG } from '../shared/constants.js';
import { StorageHelper } from '../shared/storage-helper.js';
import { Logger } from '../shared/logger.js';

// 2. Siblings (mesmo diretório)
import { SelectorGenerator } from './SelectorGenerator.js';
```

### Exports:

```javascript
// Named exports (preferido)
export class ModuleName { }
export function utilityFunction() { }

// Default export (evitar, dificulta refactoring)
export default ModuleName; // ❌ Evite
```

### Métodos:

```javascript
// Public: camelCase
publicMethod() { }

// Private: _camelCase
_privateMethod() { }

// Static: quando não precisa de instância
static utilityMethod() { }
```

### Constantes:

```javascript
// No arquivo
const LOCAL_CONSTANT = 'valor';

// Exportadas
export const EXPORTED_CONSTANT = 'valor';

// Dentro de classes (static)
static MAX_RETRIES = 3;
```

## 🔍 Code Review Checklist

Antes de commitar um módulo refatorado:

### Estrutura:
- [ ] Arquivo está em `src/[categoria]/`
- [ ] Nome do arquivo é PascalCase ou kebab-case
- [ ] Uma classe/responsabilidade por arquivo

### Documentação:
- [ ] JSDoc no topo do módulo
- [ ] JSDoc em métodos públicos
- [ ] Exemplo de uso incluído
- [ ] Parâmetros e retornos documentados

### Código:
- [ ] Imports organizados
- [ ] Exports nomeados
- [ ] Métodos privados com `_`
- [ ] Error handling presente
- [ ] Logs apropriados

### Testes:
- [ ] Testável isoladamente
- [ ] Sem dependências desnecessárias
- [ ] Pure functions quando possível

### Qualidade:
- [ ] Sem código duplicado
- [ ] Nomes descritivos
- [ ] Funções < 50 linhas
- [ ] Complexidade < 10

---

**Ver também**:
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Plano completo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura geral

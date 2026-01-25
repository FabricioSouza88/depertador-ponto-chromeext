/**
 * @module SelectorGenerator
 * @description Gera CSS selectors únicos e robustos para elementos DOM
 * 
 * Estratégia de geração (em ordem de preferência):
 * 1. ID único (#element-id)
 * 2. Atributos de teste (data-testid, data-test)
 * 3. ARIA labels (button[aria-label="..."])
 * 4. Classes CSS com path (div.container > button.primary)
 * 5. nth-of-type como último recurso
 * 
 * @example
 * const selector = SelectorGenerator.generate(buttonElement);
 * // Returns: "#button-id" ou ".class1.class2" ou "button:nth-of-type(1)"
 * 
 * const isValid = SelectorGenerator.validate(selector, buttonElement);
 * // Returns: true se selector encontra exatamente o elemento esperado
 */

export class SelectorGenerator {
  /**
   * Gera um selector CSS único para o elemento
   * @param {HTMLElement} element - Elemento DOM para gerar selector
   * @returns {string} CSS selector que identifica unicamente o elemento
   */
  static generate(element) {
    // Strategy 1: Try stable attributes first
    const stableSelector = this._tryStableAttributes(element);
    if (stableSelector) {
      return stableSelector;
    }

    // Strategy 2: Build path with classes
    const classPathSelector = this._buildClassPath(element);
    if (classPathSelector) {
      return classPathSelector;
    }

    // Strategy 3: Fallback to nth-of-type
    return this._generateNthSelector(element);
  }

  /**
   * Valida se um selector encontra exatamente o elemento esperado
   * @param {string} selector - CSS selector a validar
   * @param {HTMLElement} expectedElement - Elemento que deve ser encontrado
   * @returns {boolean} true se válido
   */
  static validate(selector, expectedElement) {
    try {
      const foundElement = document.querySelector(selector);
      return foundElement === expectedElement;
    } catch (error) {
      console.error('Erro ao validar selector:', error);
      return false;
    }
  }

  /**
   * Tenta usar atributos estáveis (ID, data-*, aria-label)
   * @private
   */
  static _tryStableAttributes(element) {
    // Try ID
    if (element.id) {
      return `#${CSS.escape(element.id)}`;
    }

    // Try data-testid
    if (element.dataset.testid) {
      return `[data-testid="${CSS.escape(element.dataset.testid)}"]`;
    }

    // Try data-test
    if (element.dataset.test) {
      return `[data-test="${CSS.escape(element.dataset.test)}"]`;
    }

    // Try aria-label (if unique)
    if (element.getAttribute('aria-label')) {
      const ariaLabel = element.getAttribute('aria-label');
      const selector = `${element.tagName.toLowerCase()}[aria-label="${CSS.escape(ariaLabel)}"]`;
      
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    return null;
  }

  /**
   * Constrói um path com classes CSS
   * @private
   */
  static _buildClassPath(element) {
    const parts = [];
    let current = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && current !== document.body && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();

      // Add classes if they help uniqueness
      if (current.className && typeof current.className === 'string') {
        const classes = current.className
          .trim()
          .split(/\s+/)
          .filter(c => c && !c.startsWith('hover') && !c.startsWith('active'))
          .slice(0, 3);
        
        if (classes.length > 0) {
          selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }

      parts.unshift(selector);

      // Check if current path is unique
      const testSelector = parts.join(' > ');
      if (document.querySelectorAll(testSelector).length === 1) {
        return testSelector;
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /**
   * Gera selector usando nth-of-type (último recurso)
   * @private
   */
  static _generateNthSelector(element) {
    const parts = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          el => el.tagName === current.tagName
        );
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      parts.unshift(selector);
      current = parent;
    }

    return parts.join(' > ');
  }

  /**
   * Escapa caracteres especiais em CSS selectors
   * @param {string} value - Valor a escapar
   * @returns {string} Valor escapado
   * @deprecated Use CSS.escape() nativo
   */
  static escape(value) {
    return CSS.escape(value);
  }
}

/**
 * Content Script - Detecta cliques no botÃ£o de ponto configurado
 * Funciona em qualquer pÃ¡gina onde o usuÃ¡rio tenha selecionado um botÃ£o
 */

// ==================== Configuration ====================
const CONFIG = {
  debounceTime: 1000 // Evita clicks duplicados
};

// ==================== Click Detector ====================
class ClickDetector {
  constructor() {
    this.lastClickTime = 0;
    this.observer = null;
    this.buttonFound = false;
    this.contextInvalidated = false; // Flag para parar se contexto invalidar
    this.mutationDebounceTimer = null;
  }

  async init() {
    // Verifica se contexto Ã© vÃ¡lido antes de iniciar
    if (!chrome.runtime?.id) {
      console.error('âŒ [Despertador Ponto] Contexto invÃ¡lido ao iniciar. Abortando.');
      this.contextInvalidated = true;
      return;
    }
    
    this.observeDOM();
    await this.findAndAttachListener();
  }

  /**
   * Observa mudanÃ§as no DOM para detectar quando o botÃ£o aparecer
   */
  observeDOM() {
    this.observer = new MutationObserver(async (mutations) => {
      // Para se contexto foi invalidado
      if (this.contextInvalidated) {
    
        this.cleanup();
        return;
      }
      
      // Debounce para evitar execuÃ§Ãµes excessivas
      clearTimeout(this.mutationDebounceTimer);
      this.mutationDebounceTimer = setTimeout(async () => {
        await this.findAndAttachListener();
      }, 3000); // 3 segundos de debounce
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Procura o botÃ£o de ponto e adiciona listener
   */
  async findAndAttachListener() {
    const button = await this.findButton();
    
    if (button) {
      // Verifica se jÃ¡ tem listener anexado
      if (!button.dataset.despertadorAttached) {
        this.attachClickListener(button);
        this.buttonFound = true;
        button.dataset.despertadorAttached = 'true';
      }
      
      // Sempre verifica e readiciona indicador se necessÃ¡rio
      if (!button.querySelector('.despertador-indicator')) {
        this.addVisualIndicator(button);
      }
    }
  }

  /**
   * Tenta encontrar o botÃ£o usando selector configurado
   */
  async findButton() {
    const config = await this.getButtonConfig();
    
    if (!config || !config.selector) {
      return null;
    }

    // Verifica se estÃ¡ na pÃ¡gina correta
    const currentUrl = window.location.href;
    if (!this.isMatchingUrl(currentUrl, config.pageUrl)) {
      return null;
    }
    
    try {
      const button = document.querySelector(config.selector);
      return button || null;
    } catch (error) {
      console.error('âŒ [Despertador Ponto] Erro ao usar selector:', error);
      return null;
    }
  }

  async getButtonConfig() {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
  
      this.contextInvalidated = true; // Marca como invalidado
      this.cleanup(); // Para o observer
      return null;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(['buttonConfig'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('âŒ [Despertador Ponto] Erro ao acessar storage:', chrome.runtime.lastError);
            
            // Se erro Ã© de contexto invalidado, marca flag
            if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
              this.contextInvalidated = true;
              this.cleanup();
            }
            
            resolve(null);
            return;
          }
          resolve(result.buttonConfig || null);
        });
      } catch (error) {
        console.error('âŒ [Despertador Ponto] ExceÃ§Ã£o ao acessar storage:', error);
        
        // Se erro Ã© de contexto invalidado, marca flag
        if (error.message?.includes('Extension context invalidated')) {
          this.contextInvalidated = true;
          this.cleanup();
        }
        
        resolve(null);
      }
    });
  }

  /**
   * Verifica se a URL atual corresponde Ã  URL configurada
   * Compara origin (protocolo + domÃ­nio + porta) e pathname
   */
  isMatchingUrl(currentUrl, configuredUrl) {
    try {
      const current = new URL(currentUrl);
      const configured = new URL(configuredUrl);
      
      // Compara origin (protocolo + domÃ­nio + porta)
      if (current.origin !== configured.origin) {
        return false;
      }
      
      // Compara pathname (caminho da URL)
      // Aceita se o pathname atual comeÃ§a com o configurado
      return current.pathname === configured.pathname || 
             current.pathname.startsWith(configured.pathname);
    } catch (error) {
      console.error('âŒ [Despertador Ponto] Erro ao comparar URLs:', error);
      return false;
    }
  }

  /**
   * Adiciona listener de click ao botÃ£o
   */
  attachClickListener(button) {
    // Listener no prÃ³prio botÃ£o
    button.addEventListener('click', (e) => this.handleClick(e), true);
    
    // Listener no parent container tambÃ©m (caso o click seja no span interno)
    const buttonLabel = button.querySelector('.MuiButton-label');
    if (buttonLabel) {
      buttonLabel.addEventListener('click', (e) => this.handleClick(e), true);
    }
  }

  /**
   * Handler do click - registra o ponto
   */
  handleClick(event) {
    const now = Date.now();
    
    // Debounce - evita clicks duplicados
    if (now - this.lastClickTime < CONFIG.debounceTime) {
      return;
    }

    this.lastClickTime = now;
    
    // Registra o ponto
    this.registerEntry(now);
    
    // Feedback visual
    this.showFeedback();
  }

  /**
   * Registra a entrada no storage
   */
  async registerEntry(timestamp) {
    try {
      // Busca entradas de hoje
      const today = this.getTodayKey();
      
      chrome.storage.local.get([today], (result) => {
        const entries = result[today] || [];
        
        // Adiciona nova entrada
        entries.push({
          timestamp: timestamp,
          source: 'auto'
        });

        // Salva
        chrome.storage.local.set({ [today]: entries }, () => {
          // Notifica o background para atualizar alarme
          chrome.runtime.sendMessage({ 
            action: 'updateAlarm',
            timestamp: timestamp 
          });

          // Mostra notificaÃ§Ã£o
          this.showNotification(entries.length);
        });
      });
    } catch (error) {
      console.error('âŒ [Despertador Ponto] Erro ao registrar entrada:', error);
    }
  }

  /**
   * Retorna a chave de hoje para o storage
   */
  getTodayKey() {
    const today = new Date();
    return `entries_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /**
   * Mostra feedback visual ao usuÃ¡rio
   */
  showFeedback() {
    const feedback = document.createElement('div');
    feedback.innerHTML = 'â° Ponto registrado pelo Despertador Ponto!';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 8px 24px rgba(0, 184, 148, 0.4);
      animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(400px);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(feedback);

    setTimeout(() => feedback.remove(), 3000);
  }

  /**
   * Mostra notificaÃ§Ã£o do Chrome
   */
  showNotification(entryCount) {
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: 'Ponto Registrado! â°',
      message: `Entrada ${entryCount} registrada em ${new Date().toLocaleTimeString('pt-BR')}`
    });
  }

  /**
   * Adiciona indicador visual no botÃ£o
   */
  addVisualIndicator(button) {
    // Verifica se jÃ¡ existe indicador
    if (button.querySelector('.despertador-indicator')) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.className = 'despertador-indicator'; // Classe para identificar
    indicator.innerHTML = 'â°';
    indicator.title = 'Monitorado pelo Despertador Ponto';
    indicator.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10;
      pointer-events: none;
    `;

    // Torna o botÃ£o relativo para posicionar o indicador
    if (window.getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }
    button.appendChild(indicator);
  }

  /**
   * Limpa observers
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.mutationDebounceTimer) {
      clearTimeout(this.mutationDebounceTimer);
      this.mutationDebounceTimer = null;
    }
  }
}

// ==================== Element Picker ====================
class ElementPicker {
  constructor() {
    this.isActive = false;
    this.hoveredElement = null;
    this.overlay = null;
    this.tooltip = null;
    this.originalOutline = new Map();
  }

  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.createOverlay();

    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);

    // Prevent scrolling while picker is active
    document.body.style.overflow = 'hidden';
  }

  stop() {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    // Clean up overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    // Restore original outlines
    this.originalOutline.forEach((outline, element) => {
      element.style.outline = outline;
    });
    this.originalOutline.clear();

    // Restore scrolling
    document.body.style.overflow = '';
  }

  createOverlay() {
    console.log('ðŸŽ¨ [Picker] createOverlay() iniciado');
    
    this.overlay = document.createElement('div');
    this.overlay.id = 'despertador-ponto-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999998;
      cursor: crosshair;
      pointer-events: none;
    `;
    console.log('âœ… [Picker] Overlay criado (pointer-events: none)');

    this.tooltip = document.createElement('div');
    this.tooltip.id = 'despertador-ponto-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
    `;
    this.tooltip.textContent = 'ðŸ–±ï¸ CLIQUE no botÃ£o que deseja monitorar â€¢ ESC para cancelar';



    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);

    console.log('ðŸ“Š [Picker] Overlay no DOM?', document.getElementById('despertador-ponto-overlay') !== null);
    console.log('ðŸ“Š [Picker] Tooltip no DOM?', document.getElementById('despertador-ponto-tooltip') !== null);

  }

  handleMouseOver = (e) => {
    if (!this.isActive) {
  
      return;
    }
    
    const target = e.target;
    
    // Ignore our own elements
    if (target.id === 'despertador-ponto-overlay' || 
        target.id === 'despertador-ponto-tooltip') {
  
      return;
    }



    this.hoveredElement = target;

    // Store original outline
    if (!this.originalOutline.has(target)) {
      this.originalOutline.set(target, target.style.outline);
    }

    // Highlight element
    target.style.outline = '3px solid #667eea';
    target.style.outlineOffset = '2px';
  };

  handleMouseOut = (e) => {
    if (!this.isActive) return;

    const target = e.target;

    // Restore original outline
    if (this.originalOutline.has(target)) {
      const originalOutline = this.originalOutline.get(target);
      target.style.outline = originalOutline;
  
    }
  };

  handleClick = (e) => {

    
    if (!this.isActive) {
  
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    console.log('âœ… [Picker] Click interceptado (preventDefault + stopPropagation)');

    const target = e.target;
    console.log('ðŸŽ¯ [Picker] Elemento clicado:', {
      tag: target.tagName,
      id: target.id,
      class: target.className,
      text: target.textContent?.substring(0, 50)
    });

    // Ignore our own elements
    if (target.id === 'despertador-ponto-overlay' || 
        target.id === 'despertador-ponto-tooltip') {
  
      return;
    }



    // Generate selector

    const selector = this.generateSelector(target);


    if (selector) {
      // Verify selector works
  
      const testElement = document.querySelector(selector);
      
      if (testElement === target) {
    
        this.saveSelector(selector);
      } else {
        console.error('âŒ [Picker] Selector invÃ¡lido - elemento encontrado Ã© diferente');
    
    
        this.showError('Erro ao gerar seletor. Tente outro elemento.');
      }
    } else {
      console.error('âŒ [Picker] Falha ao gerar selector');
      this.showError('Erro ao gerar seletor');
    }


    this.stop();
  };

  handleKeyDown = (e) => {
    if (!this.isActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
  
      this.stop();
    }
  };

  /**
   * Verifica se uma classe CSS Ã© estÃ¡vel (nÃ£o dinÃ¢mica)
   */
  isStableClass(className) {
    if (!className) return false;
    
    // Classes dinÃ¢micas que devem ser evitadas
    const dynamicPatterns = [
      /^jss\d+$/,                    // Material-UI: jss154, jss137
      /^css-[a-z0-9]+$/i,            // CSS-in-JS: css-abc123
      /^makeStyles-\w+-\d+$/,        // Material-UI makeStyles: makeStyles-root-1
      /^[a-z0-9]{6,}$/i,             // Hash puro: a1b2c3d4e5
      /^sc-[a-z0-9]+$/i,             // Styled-components: sc-abc123
      /^emotion-\d+$/,               // Emotion CSS: emotion-0
      /^\w+-\d+-\d+-\d+$/           // Tailwind JIT: mt-4-5-6
    ];
    
    // Verifica se a classe corresponde a algum padrÃ£o dinÃ¢mico
    return !dynamicPatterns.some(pattern => pattern.test(className));
  }

  /**
   * Extrai classes estÃ¡veis de um elemento
   */
  getStableClasses(element) {
    if (!element.className || typeof element.className !== 'string') {
      return [];
    }
    
    return element.className.trim().split(/\s+/)
      .filter(c => this.isStableClass(c))
      .filter(c => !c.startsWith('hover') && !c.startsWith('active'))
      .slice(0, 3); // MÃ¡ximo 3 classes para performance
  }

  generateSelector(element) {
    // Try stable attributes first
    if (element.id) {
      return `#${CSS.escape(element.id)}`;
    }

    if (element.dataset.testid) {
      return `[data-testid="${CSS.escape(element.dataset.testid)}"]`;
    }

    if (element.dataset.test) {
      return `[data-test="${CSS.escape(element.dataset.test)}"]`;
    }

    // Try aria-label for buttons
    if (element.getAttribute('aria-label')) {
      const ariaLabel = element.getAttribute('aria-label');
      const selector = `${element.tagName.toLowerCase()}[aria-label="${CSS.escape(ariaLabel)}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    // Try text content for buttons (very stable)
    if (element.tagName.toLowerCase() === 'button') {
      const text = element.textContent.trim();
      if (text && text.length > 0 && text.length < 50) {
        // Use XPath-like approach with text
        const buttons = Array.from(document.querySelectorAll('button'));
        const matchingButtons = buttons.filter(btn => btn.textContent.trim() === text);
        
        if (matchingButtons.length === 1) {
          // Generate selector with text validation
      
          // Still return structural selector but log the text for reference
        }
      }
    }

    // Try data attributes (very stable)
    const dataAttrs = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-') && attr.value)
      .filter(attr => !attr.name.includes('test') && !attr.name.includes('id')); // Avoid test IDs
    
    for (const attr of dataAttrs) {
      const selector = `${element.tagName.toLowerCase()}[${attr.name}="${CSS.escape(attr.value)}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    // Build path with classes
    const parts = [];
    let current = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && current !== document.body && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();

      // Add stable classes if they help uniqueness
      const classes = this.getStableClasses(current);
      if (classes.length > 0) {
        selector += '.' + classes.map(c => CSS.escape(c)).join('.');
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

    // Fallback: use nth-of-type
    const fullSelector = this.generateNthSelector(element);
    return fullSelector;
  }

  generateNthSelector(element) {
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

  async saveSelector(selector) {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.error('âŒ [Despertador Ponto] Contexto da extensÃ£o invalidado');
      this.showError('ExtensÃ£o foi recarregada. Por favor, recarregue esta pÃ¡gina (F5) e tente novamente.');
      return;
    }

    try {
      const buttonConfig = {
        selector: selector,
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString()
      };
      
      await chrome.storage.local.set({ buttonConfig: buttonConfig });
      
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
      
  
      
      this.showSuccess(`BotÃ£o configurado!\nPÃ¡gina: ${buttonConfig.pageTitle}\nSelector: ${selector}`);
      
      // Notify that selector was saved - reinit detector
      if (detector) {
        detector.buttonFound = false;
        await detector.findAndAttachListener();
      }
    } catch (error) {
      console.error('âŒ [Despertador Ponto] Erro ao salvar configuraÃ§Ã£o:', error);
      
      if (error.message?.includes('Extension context invalidated')) {
        this.showError('ExtensÃ£o foi recarregada. Recarregue a pÃ¡gina (F5) e tente novamente.');
      } else {
        this.showError('Erro ao salvar configuraÃ§Ã£o: ' + error.message);
      }
    }
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 8px 24px rgba(0, 184, 148, 0.4);
      white-space: pre-line;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// ==================== Initialization ====================
let detector = null;
let picker = null;

// Aguarda o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDetector);
} else {
  initDetector();
}

function initDetector() {
  // Verifica se contexto Ã© vÃ¡lido antes de inicializar
  if (!chrome.runtime?.id) {
    console.error('âŒ [Despertador Ponto] Contexto invÃ¡lido no init. ExtensÃ£o foi recarregada.');
    console.warn('âš ï¸ [Despertador Ponto] Por favor, recarregue esta pÃ¡gina (F5) para usar a extensÃ£o.');
    return;
  }
  
  detector = new ClickDetector();
  detector.init();
  
  // Initialize picker instance
  picker = new ElementPicker();
  
  console.log('âœ… [Despertador Ponto] Detector e Picker inicializados');
}

// Cleanup ao descarregar
window.addEventListener('unload', () => {
  if (detector) {
    detector.cleanup();
  }
  if (picker && picker.isActive) {
    picker.stop();
  }
});

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('âŒ [Content] Contexto da extensÃ£o invalidado. Mensagem ignorada.');
    return false;
  }

  console.log('ðŸ“¨ [Content] Mensagem recebida:', request);
  
  if (request.action === 'ping') {

    sendResponse({ status: 'active' });
    return true;
  }

  if (request.action === 'startPicker') {

    if (!picker) {
  
      picker = new ElementPicker();
    }
    
    try {
      picker.start();
  
      sendResponse({ success: true });
    } catch (error) {
      console.error('âŒ [Content] Erro ao iniciar picker:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.action === 'stopPicker') {

    if (picker) {
      picker.stop();
  
    }
    sendResponse({ success: true });
    return true;
  }
  
  console.warn('âš ï¸ [Content] AÃ§Ã£o desconhecida:', request.action);
});

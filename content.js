/**
 * Content Script - Detecta cliques no botão de ponto configurado
 * Funciona em qualquer página onde o usuário tenha selecionado um botão
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
  }

  async init() {
    console.log('🚀 [Despertador Ponto] Content script inicializado');
    
    // Verifica se contexto é válido antes de iniciar
    if (!chrome.runtime?.id) {
      console.error('❌ [Despertador Ponto] Contexto inválido ao iniciar. Abortando.');
      this.contextInvalidated = true;
      return;
    }
    
    this.observeDOM();
    await this.findAndAttachListener();
  }

  /**
   * Observa mudanças no DOM para detectar quando o botão aparecer
   */
  observeDOM() {
    this.observer = new MutationObserver(async (mutations) => {
      // Para se contexto foi invalidado
      if (this.contextInvalidated) {
        console.warn('⚠️ [Despertador Ponto] Contexto invalidado, parando observer');
        this.cleanup();
        return;
      }
      
      if (!this.buttonFound) {
        await this.findAndAttachListener();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Procura o botão de ponto e adiciona listener
   */
  async findAndAttachListener() {
    const button = await this.findButton();
    
    if (button && !button.dataset.despertadorAttached) {
      console.log('✅ [Despertador Ponto] Botão de ponto encontrado!', button);
      this.attachClickListener(button);
      this.buttonFound = true;
      button.dataset.despertadorAttached = 'true';
      
      // Adiciona indicador visual
      this.addVisualIndicator(button);
    }
  }

  /**
   * Tenta encontrar o botão usando selector configurado
   */
  async findButton() {
    const config = await this.getButtonConfig();
    
    if (!config || !config.selector) {
      console.log('ℹ️ [Despertador Ponto] Nenhum botão configurado');
      return null;
    }

    // Verifica se está na página correta
    const currentUrl = window.location.href;
    if (!this.isMatchingUrl(currentUrl, config.pageUrl)) {
      console.log('ℹ️ [Despertador Ponto] Página atual não corresponde à configuração', {
        current: currentUrl,
        configured: config.pageUrl
      });
      return null;
    }

    console.log('🔍 [Despertador Ponto] Procurando botão configurado:', config.selector);
    
    try {
      const button = document.querySelector(config.selector);
      if (button) {
        console.log('✅ [Despertador Ponto] Botão encontrado!');
        return button;
      } else {
        console.warn('⚠️ [Despertador Ponto] Selector não encontrou elemento na página');
      }
    } catch (error) {
      console.error('❌ [Despertador Ponto] Erro ao usar selector:', error);
    }

    return null;
  }

  async getButtonConfig() {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.warn('⚠️ [Despertador Ponto] Contexto da extensão invalidado. Recarregue a página.');
      this.contextInvalidated = true; // Marca como invalidado
      this.cleanup(); // Para o observer
      return null;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(['buttonConfig'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('❌ [Despertador Ponto] Erro ao acessar storage:', chrome.runtime.lastError);
            
            // Se erro é de contexto invalidado, marca flag
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
        console.error('❌ [Despertador Ponto] Exceção ao acessar storage:', error);
        
        // Se erro é de contexto invalidado, marca flag
        if (error.message?.includes('Extension context invalidated')) {
          this.contextInvalidated = true;
          this.cleanup();
        }
        
        resolve(null);
      }
    });
  }

  /**
   * Verifica se a URL atual corresponde à URL configurada
   * Compara origin (protocolo + domínio + porta) e pathname
   */
  isMatchingUrl(currentUrl, configuredUrl) {
    try {
      const current = new URL(currentUrl);
      const configured = new URL(configuredUrl);
      
      // Compara origin (protocolo + domínio + porta)
      if (current.origin !== configured.origin) {
        return false;
      }
      
      // Compara pathname (caminho da URL)
      // Aceita se o pathname atual começa com o configurado
      return current.pathname === configured.pathname || 
             current.pathname.startsWith(configured.pathname);
    } catch (error) {
      console.error('❌ [Despertador Ponto] Erro ao comparar URLs:', error);
      return false;
    }
  }

  /**
   * Adiciona listener de click ao botão
   */
  attachClickListener(button) {
    // Listener no próprio botão
    button.addEventListener('click', (e) => this.handleClick(e), true);
    
    // Listener no parent container também (caso o click seja no span interno)
    const buttonLabel = button.querySelector('.MuiButton-label');
    if (buttonLabel) {
      buttonLabel.addEventListener('click', (e) => this.handleClick(e), true);
    }

    console.log('🎯 [Despertador Ponto] Listener anexado ao botão');
  }

  /**
   * Handler do click - registra o ponto
   */
  handleClick(event) {
    const now = Date.now();
    
    // Debounce - evita clicks duplicados
    if (now - this.lastClickTime < CONFIG.debounceTime) {
      console.log('⏱️ [Despertador Ponto] Click ignorado (debounce)');
      return;
    }

    this.lastClickTime = now;
    
    console.log('✨ [Despertador Ponto] Ponto registrado!', new Date(now));
    
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
          console.log('💾 [Despertador Ponto] Entrada salva:', {
            total: entries.length,
            timestamp: new Date(timestamp).toLocaleTimeString('pt-BR')
          });

          // Notifica o background para atualizar alarme
          chrome.runtime.sendMessage({ 
            action: 'updateAlarm',
            timestamp: timestamp 
          });

          // Mostra notificação
          this.showNotification(entries.length);
        });
      });
    } catch (error) {
      console.error('❌ [Despertador Ponto] Erro ao registrar entrada:', error);
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
   * Mostra feedback visual ao usuário
   */
  showFeedback() {
    const feedback = document.createElement('div');
    feedback.innerHTML = '⏰ Ponto registrado pelo Despertador Ponto!';
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
   * Mostra notificação do Chrome
   */
  showNotification(entryCount) {
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: 'Ponto Registrado! ⏰',
      message: `Entrada ${entryCount} registrada em ${new Date().toLocaleTimeString('pt-BR')}`
    });
  }

  /**
   * Adiciona indicador visual no botão
   */
  addVisualIndicator(button) {
    const indicator = document.createElement('div');
    indicator.innerHTML = '⏰';
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
    `;

    // Torna o botão relativo para posicionar o indicador
    button.style.position = 'relative';
    button.appendChild(indicator);
  }

  /**
   * Limpa observers
   */
  cleanup() {
    console.log('🧹 [Despertador Ponto] Limpando detector...');
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('✅ [Despertador Ponto] Observer desconectado');
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
    console.log('🚀 [Picker] start() chamado');
    
    if (this.isActive) {
      console.warn('⚠️ [Picker] Picker já está ativo, ignorando');
      return;
    }

    this.isActive = true;
    console.log('✅ [Picker] isActive = true');

    // Create overlay
    console.log('🎨 [Picker] Criando overlay...');
    this.createOverlay();

    // Add event listeners
    console.log('🎧 [Picker] Adicionando event listeners...');
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    console.log('✅ [Picker] Event listeners adicionados');

    // Prevent scrolling while picker is active
    document.body.style.overflow = 'hidden';
    console.log('🎯 [Picker] Picker PRONTO! Mova o mouse sobre os elementos e CLIQUE no botão desejado');
  }

  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    console.log('🛑 [Despertador Ponto] Picker parado');

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
    console.log('🎨 [Picker] createOverlay() iniciado');
    
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
    console.log('✅ [Picker] Overlay criado (pointer-events: none)');

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
    this.tooltip.textContent = '🖱️ CLIQUE no botão que deseja monitorar • ESC para cancelar';
    console.log('✅ [Picker] Tooltip criado');

    console.log('📍 [Picker] Adicionando overlay e tooltip ao body...');
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
    console.log('✅ [Picker] Overlay e tooltip adicionados ao DOM');
    console.log('📊 [Picker] Overlay no DOM?', document.getElementById('despertador-ponto-overlay') !== null);
    console.log('📊 [Picker] Tooltip no DOM?', document.getElementById('despertador-ponto-tooltip') !== null);
    console.log('🎯 [Picker] AGORA você pode clicar nos elementos da página!');
  }

  handleMouseOver = (e) => {
    if (!this.isActive) {
      console.log('⚠️ [Picker] handleMouseOver ignorado - picker não está ativo');
      return;
    }
    
    const target = e.target;
    
    // Ignore our own elements
    if (target.id === 'despertador-ponto-overlay' || 
        target.id === 'despertador-ponto-tooltip') {
      console.log('⚠️ [Picker] Mouse sobre overlay/tooltip - ignorando');
      return;
    }

    console.log('🖱️ [Picker] Mouse sobre elemento:', target.tagName, target.className);

    this.hoveredElement = target;

    // Store original outline
    if (!this.originalOutline.has(target)) {
      this.originalOutline.set(target, target.style.outline);
    }

    // Highlight element
    target.style.outline = '3px solid #667eea';
    target.style.outlineOffset = '2px';
    console.log('✨ [Picker] Elemento destacado com borda azul');
  };

  handleMouseOut = (e) => {
    if (!this.isActive) return;

    const target = e.target;

    // Restore original outline
    if (this.originalOutline.has(target)) {
      const originalOutline = this.originalOutline.get(target);
      target.style.outline = originalOutline;
      console.log('🔄 [Picker] Outline restaurado');
    }
  };

  handleClick = (e) => {
    console.log('🖱️ [Picker] Click detectado!', e.target);
    
    if (!this.isActive) {
      console.warn('⚠️ [Picker] Picker não está ativo, ignorando click');
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    console.log('✅ [Picker] Click interceptado (preventDefault + stopPropagation)');

    const target = e.target;
    console.log('🎯 [Picker] Elemento clicado:', {
      tag: target.tagName,
      id: target.id,
      class: target.className,
      text: target.textContent?.substring(0, 50)
    });

    // Ignore our own elements
    if (target.id === 'despertador-ponto-overlay' || 
        target.id === 'despertador-ponto-tooltip') {
      console.log('⚠️ [Picker] Click foi no overlay/tooltip, ignorando');
      return;
    }

    console.log('✅ [Picker] Elemento válido selecionado!');

    // Generate selector
    console.log('🔧 [Picker] Gerando selector...');
    const selector = this.generateSelector(target);
    console.log('📝 [Picker] Selector gerado:', selector);

    if (selector) {
      // Verify selector works
      console.log('🔍 [Picker] Verificando se selector funciona...');
      const testElement = document.querySelector(selector);
      
      if (testElement === target) {
        console.log('✅ [Picker] Selector válido! Salvando...');
        this.saveSelector(selector);
      } else {
        console.error('❌ [Picker] Selector inválido - elemento encontrado é diferente');
        console.log('Elemento esperado:', target);
        console.log('Elemento encontrado:', testElement);
        this.showError('Erro ao gerar seletor. Tente outro elemento.');
      }
    } else {
      console.error('❌ [Picker] Falha ao gerar selector');
      this.showError('Erro ao gerar seletor');
    }

    console.log('🛑 [Picker] Parando picker...');
    this.stop();
  };

  handleKeyDown = (e) => {
    if (!this.isActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      console.log('❌ [Despertador Ponto] Picker cancelado');
      this.stop();
    }
  };

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

    // Build path with classes
    const parts = [];
    let current = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && current !== document.body && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();

      // Add classes if they help uniqueness
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/)
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
      console.error('❌ [Despertador Ponto] Contexto da extensão invalidado');
      this.showError('Extensão foi recarregada. Por favor, recarregue esta página (F5) e tente novamente.');
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
      
      console.log('💾 [Despertador Ponto] Configuração salva:', buttonConfig);
      
      this.showSuccess(`Botão configurado!\nPágina: ${buttonConfig.pageTitle}\nSelector: ${selector}`);
      
      // Notify that selector was saved - reinit detector
      if (detector) {
        detector.buttonFound = false;
        await detector.findAndAttachListener();
      }
    } catch (error) {
      console.error('❌ [Despertador Ponto] Erro ao salvar configuração:', error);
      
      if (error.message?.includes('Extension context invalidated')) {
        this.showError('Extensão foi recarregada. Recarregue a página (F5) e tente novamente.');
      } else {
        this.showError('Erro ao salvar configuração: ' + error.message);
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
  // Verifica se contexto é válido antes de inicializar
  if (!chrome.runtime?.id) {
    console.error('❌ [Despertador Ponto] Contexto inválido no init. Extensão foi recarregada.');
    console.warn('⚠️ [Despertador Ponto] Por favor, recarregue esta página (F5) para usar a extensão.');
    return;
  }
  
  detector = new ClickDetector();
  detector.init();
  
  // Initialize picker instance
  picker = new ElementPicker();
  
  console.log('✅ [Despertador Ponto] Detector e Picker inicializados');
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
    console.error('❌ [Content] Contexto da extensão invalidado. Mensagem ignorada.');
    return false;
  }

  console.log('📨 [Content] Mensagem recebida:', request);
  
  if (request.action === 'ping') {
    console.log('🏓 [Content] Respondendo ping com status active');
    sendResponse({ status: 'active' });
    return true;
  }

  if (request.action === 'startPicker') {
    console.log('🎯 [Content] Iniciando picker...');
    if (!picker) {
      console.log('📝 [Content] Criando nova instância de ElementPicker');
      picker = new ElementPicker();
    }
    
    try {
      picker.start();
      console.log('✅ [Content] Picker iniciado com sucesso!');
      sendResponse({ success: true });
    } catch (error) {
      console.error('❌ [Content] Erro ao iniciar picker:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.action === 'stopPicker') {
    console.log('🛑 [Content] Parando picker...');
    if (picker) {
      picker.stop();
      console.log('✅ [Content] Picker parado');
    }
    sendResponse({ success: true });
    return true;
  }
  
  console.warn('⚠️ [Content] Ação desconhecida:', request.action);
});

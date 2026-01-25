/**
 * Content Script - Detecta cliques no botão de ponto do Ahgora
 * Injeta código na página https://app.ahgora.com.br/novabatidaonline/
 */

// ==================== Configuration ====================
const CONFIG = {
  targetLabel: 'Clocking in',
  buttonSelector: 'button',
  checkInterval: 2000, // Verifica a cada 2 segundos se o botão existe
  debounceTime: 1000 // Evita clicks duplicados
};

// ==================== Click Detector ====================
class ClickDetector {
  constructor() {
    this.lastClickTime = 0;
    this.observer = null;
    this.buttonFound = false;
  }

  init() {
    console.log('🚀 [Despertador Ponto] Content script inicializado');
    this.observeDOM();
    this.findAndAttachListener();
  }

  /**
   * Observa mudanças no DOM para detectar quando o botão aparecer
   */
  observeDOM() {
    this.observer = new MutationObserver((mutations) => {
      if (!this.buttonFound) {
        this.findAndAttachListener();
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
  findAndAttachListener() {
    const button = this.findButton();
    
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
   * Tenta encontrar o botão com label exato "Clocking in"
   */
  findButton() {
    const buttons = document.querySelectorAll(CONFIG.buttonSelector);
    for (const button of buttons) {
      const labelText = this.getButtonLabelText(button);
      if (!labelText) continue;

      const normalized = labelText.replace(/\s+/g, ' ').trim().toLowerCase();
      if (normalized === CONFIG.targetLabel.toLowerCase()) {
        return button;
      }
    }

    return null;
  }

  getButtonLabelText(button) {
    const typography = button.querySelector('p.MuiTypography-root');
    if (typography && typography.textContent) {
      return typography.textContent;
    }

    return button.textContent || '';
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
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ==================== Initialization ====================
let detector = null;

// Aguarda o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDetector);
} else {
  initDetector();
}

function initDetector() {
  detector = new ClickDetector();
  detector.init();
}

// Cleanup ao descarregar
window.addEventListener('unload', () => {
  if (detector) {
    detector.cleanup();
  }
});

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'active' });
  }
});

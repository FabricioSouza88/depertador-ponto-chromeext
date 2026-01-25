// ==================== Storage Manager ====================
class StorageManager {
  static async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  static async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  static async getEntriesToday() {
    const today = this.getTodayKey();
    const entries = await this.get(today);
    return entries || [];
  }

  static async addEntry(timestamp, source = 'manual') {
    const today = this.getTodayKey();
    const entries = await this.getEntriesToday();
    entries.push({ timestamp, source });
    await this.set(today, entries);
    return entries;
  }

  static async removeEntry(timestamp) {
    const today = this.getTodayKey();
    let entries = await this.getEntriesToday();
    entries = entries.filter(e => e.timestamp !== timestamp);
    await this.set(today, entries);
    return entries;
  }

  static async clearToday() {
    const today = this.getTodayKey();
    await this.set(today, []);
  }

  static async getSettings() {
    const settings = await this.get('settings');
    return settings || { workHours: 8, breakMinutes: 60 };
  }

  static async saveSettings(settings) {
    await this.set('settings', settings);
  }

  static getTodayKey() {
    const today = new Date();
    return `entries_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}

// ==================== Time Calculator ====================
class TimeCalculator {
  static calculateExitTime(entries, settings) {
    if (!entries || entries.length === 0) {
      return null;
    }

    // Pega a primeira entrada do dia
    const firstEntry = entries[0].timestamp;
    const workHours = settings.workHours || 8;
    const breakMinutes = settings.breakMinutes || 60;

    // Calcula horário de saída: primeira entrada + horas de trabalho + intervalo
    const exitTime = new Date(firstEntry);
    exitTime.setHours(exitTime.getHours() + workHours);
    exitTime.setMinutes(exitTime.getMinutes() + breakMinutes);

    return exitTime;
  }

  static formatTime(date) {
    if (!date) return '--:--';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  static formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  }

  static getTimeRemaining(exitTime) {
    if (!exitTime) return null;

    const now = new Date();
    const diff = exitTime - now;

    if (diff <= 0) {
      return { text: 'Hora de sair! 🎉', expired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      text: `${hours}h ${minutes}min`,
      expired: false,
      percentage: 0
    };
  }

  static calculateProgress(entries, exitTime, settings) {
    if (!entries || entries.length === 0 || !exitTime) {
      return 0;
    }

    const firstEntry = new Date(entries[0].timestamp);
    const now = new Date();
    const totalWorkTime = (settings.workHours * 60 + settings.breakMinutes) * 60 * 1000;
    const elapsed = now - firstEntry;

    return Math.min(100, Math.max(0, (elapsed / totalWorkTime) * 100));
  }
}

// ==================== UI Manager ====================
class UIManager {
  constructor() {
    this.elements = {
      todayDate: document.getElementById('today-date'),
      entriesList: document.getElementById('entries-list'),
      manualTime: document.getElementById('manual-time'),
      addManual: document.getElementById('add-manual'),
      exitTime: document.getElementById('exit-time'),
      timeRemaining: document.getElementById('time-remaining'),
      progressFill: document.getElementById('progress-fill'),
      calculateExit: document.getElementById('calculate-exit'),
      workHours: document.getElementById('work-hours'),
      breakMinutes: document.getElementById('break-minutes'),
      saveSettings: document.getElementById('save-settings'),
      clearToday: document.getElementById('clear-today')
    };

    this.updateInterval = null;
  }

  init() {
    this.setupEventListeners();
    this.updateTodayDate();
    this.loadSettings();
    this.refreshUI();
    this.startAutoUpdate();
  }

  setupEventListeners() {
    this.elements.addManual.addEventListener('click', () => this.addManualEntry());
    this.elements.calculateExit.addEventListener('click', () => this.refreshUI());
    this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
    this.elements.clearToday.addEventListener('click', () => this.clearToday());
    
    // Permite adicionar entrada com Enter
    this.elements.manualTime.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addManualEntry();
    });
  }

  updateTodayDate() {
    this.elements.todayDate.textContent = TimeCalculator.formatDate(new Date());
  }

  async loadSettings() {
    const settings = await StorageManager.getSettings();
    this.elements.workHours.value = settings.workHours;
    this.elements.breakMinutes.value = settings.breakMinutes;
  }

  async saveSettings() {
    const settings = {
      workHours: parseFloat(this.elements.workHours.value),
      breakMinutes: parseInt(this.elements.breakMinutes.value)
    };

    await StorageManager.saveSettings(settings);
    this.showNotification('Configurações salvas com sucesso!', 'success');
    this.refreshUI();

    // Atualiza o alarme no background
    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  async addManualEntry() {
    const timeValue = this.elements.manualTime.value;
    if (!timeValue) {
      this.showNotification('Por favor, selecione um horário', 'error');
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);

    await StorageManager.addEntry(timestamp.getTime(), 'manual');
    this.elements.manualTime.value = '';
    this.showNotification('Entrada adicionada com sucesso!', 'success');
    this.refreshUI();

    // Notifica o background para configurar alarme
    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  async refreshUI() {
    const entries = await StorageManager.getEntriesToday();
    const settings = await StorageManager.getSettings();

    this.renderEntries(entries);
    this.updateExitInfo(entries, settings);
  }

  renderEntries(entries) {
    if (!entries || entries.length === 0) {
      this.elements.entriesList.innerHTML = '<p class="empty-state">Nenhuma entrada registrada hoje</p>';
      return;
    }

    const html = entries.map((entry, index) => {
      const date = new Date(entry.timestamp);
      const time = TimeCalculator.formatTime(date);
      const source = entry.source === 'auto' ? 'Automático' : 'Manual';
      
      return `
        <div class="entry-item">
          <div>
            <span class="time">${time}</span>
            <span class="source">(${source})</span>
          </div>
          <button class="remove-btn" data-timestamp="${entry.timestamp}">Remover</button>
        </div>
      `;
    }).join('');

    this.elements.entriesList.innerHTML = html;

    // Adiciona listeners para os botões de remover
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeEntry(parseInt(btn.dataset.timestamp)));
    });
  }

  async removeEntry(timestamp) {
    await StorageManager.removeEntry(timestamp);
    this.showNotification('Entrada removida', 'success');
    this.refreshUI();
    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  updateExitInfo(entries, settings) {
    const exitTime = TimeCalculator.calculateExitTime(entries, settings);
    
    if (!exitTime) {
      this.elements.exitTime.textContent = '--:--';
      this.elements.timeRemaining.textContent = 'Nenhuma entrada registrada';
      this.elements.progressFill.style.width = '0%';
      return;
    }

    this.elements.exitTime.textContent = TimeCalculator.formatTime(exitTime);
    
    const remaining = TimeCalculator.getTimeRemaining(exitTime);
    if (remaining) {
      this.elements.timeRemaining.textContent = remaining.text;
      this.elements.timeRemaining.style.color = remaining.expired ? '#e74c3c' : '#2c3e50';
    }

    const progress = TimeCalculator.calculateProgress(entries, exitTime, settings);
    this.elements.progressFill.style.width = `${progress}%`;
  }

  async clearToday() {
    if (!confirm('Tem certeza que deseja limpar todos os registros de hoje?')) {
      return;
    }

    await StorageManager.clearToday();
    this.showNotification('Registros limpos', 'success');
    this.refreshUI();
    chrome.runtime.sendMessage({ action: 'clearAlarm' });
  }

  showNotification(message, type = 'info') {
    // Cria uma notificação temporária
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  startAutoUpdate() {
    // Atualiza a cada minuto
    this.updateInterval = setInterval(() => {
      this.refreshUI();
    }, 60000);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIManager();
  ui.init();
});

// Limpa o intervalo quando o popup é fechado
window.addEventListener('unload', () => {
  if (window.uiManager) {
    window.uiManager.stopAutoUpdate();
  }
});

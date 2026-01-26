/**
 * Versão com i18n do popup.js
 * Importa o sistema de internacionalização
 */

import { getI18n } from './src/shared/i18n.js';

// Instância global do i18n
let i18n = null;

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

    const firstEntry = entries[0].timestamp;
    const workHours = settings.workHours || 8;
    const breakMinutes = settings.breakMinutes || 60;

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
    const currentLang = i18n.getCurrentLanguage();
    const locale = currentLang === 'es' ? 'es-ES' : currentLang === 'en-US' ? 'en-US' : 'pt-BR';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(locale, options);
  }

  static getTimeRemaining(exitTime) {
    if (!exitTime) return null;

    const now = new Date();
    const diff = exitTime - now;

    if (diff <= 0) {
      return { text: i18n.t('popup.exit.timeToLeave'), expired: true };
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
      clearToday: document.getElementById('clear-today'),
      selectorStatus: document.getElementById('selector-status'),
      selectorInfo: document.getElementById('selector-info'),
      selectorDisplay: document.getElementById('selector-display'),
      selectButton: document.getElementById('select-button'),
      clearSelector: document.getElementById('clear-selector'),
      languageSelect: document.getElementById('language-select')
    };

    this.updateInterval = null;
  }

  async init() {
    // Inicializa i18n primeiro
    await i18n.init();
    
    // Aplica traduções
    this.applyTranslations();
    
    // Carrega idioma selecionado no select
    this.elements.languageSelect.value = i18n.getCurrentLanguage();
    
    this.setupEventListeners();
    this.updateTodayDate();
    this.loadSettings();
    this.loadSelectorStatus();
    this.refreshUI();
    this.startAutoUpdate();
  }

  /**
   * Aplica traduções em todos os elementos com data-i18n
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = i18n.t(key);
      
      if (element.tagName === 'INPUT' && element.type === 'time') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    // Atualiza título da página
    document.title = i18n.t('popup.title');
  }

  setupEventListeners() {
    this.elements.addManual.addEventListener('click', () => this.addManualEntry());
    this.elements.calculateExit.addEventListener('click', () => this.refreshUI());
    this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
    this.elements.clearToday.addEventListener('click', () => this.clearToday());
    this.elements.selectButton.addEventListener('click', () => this.startButtonPicker());
    this.elements.clearSelector.addEventListener('click', () => this.clearButtonSelector());
    this.elements.languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    
    this.elements.manualTime.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addManualEntry();
    });
  }

  async changeLanguage(languageCode) {
    await i18n.changeLanguage(languageCode);
    this.applyTranslations();
    await this.refreshUI(); // Recarrega UI com novas traduções
    this.showNotification(i18n.t('popup.notifications.languageChanged'), 'success');
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
    this.showNotification(i18n.t('popup.notifications.settingsSaved'), 'success');
    this.refreshUI();

    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  async addManualEntry() {
    const timeValue = this.elements.manualTime.value;
    if (!timeValue) {
      this.showNotification(i18n.t('popup.notifications.selectTime'), 'error');
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);

    await StorageManager.addEntry(timestamp.getTime(), 'manual');
    this.elements.manualTime.value = '';
    this.showNotification(i18n.t('popup.notifications.entryAdded'), 'success');
    this.refreshUI();

    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  async refreshUI() {
    const entries = await StorageManager.getEntriesToday();
    const settings = await StorageManager.getSettings();

    this.renderEntries(entries);
    this.updateExitInfo(entries, settings);
    this.updateTodayDate(); // Atualiza data formatada no idioma atual
  }

  renderEntries(entries) {
    if (!entries || entries.length === 0) {
      this.elements.entriesList.innerHTML = `<p class="empty-state">${i18n.t('popup.entries.empty')}</p>`;
      return;
    }

    const html = entries.map((entry) => {
      const date = new Date(entry.timestamp);
      const time = TimeCalculator.formatTime(date);
      const source = entry.source === 'auto' ? i18n.t('popup.entries.automatic') : i18n.t('popup.entries.manual');
      
      return `
        <div class="entry-item">
          <div>
            <span class="time">${time}</span>
            <span class="source">(${source})</span>
          </div>
          <button class="remove-btn" data-timestamp="${entry.timestamp}">${i18n.t('popup.entries.remove')}</button>
        </div>
      `;
    }).join('');

    this.elements.entriesList.innerHTML = html;

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeEntry(parseInt(btn.dataset.timestamp)));
    });
  }

  async removeEntry(timestamp) {
    await StorageManager.removeEntry(timestamp);
    this.showNotification(i18n.t('popup.notifications.entryRemoved'), 'success');
    this.refreshUI();
    chrome.runtime.sendMessage({ action: 'updateAlarm' });
  }

  updateExitInfo(entries, settings) {
    const exitTime = TimeCalculator.calculateExitTime(entries, settings);
    
    if (!exitTime) {
      this.elements.exitTime.textContent = '--:--';
      this.elements.timeRemaining.textContent = i18n.t('popup.exit.noEntries');
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
    if (!confirm(i18n.t('confirmations.clearRecords'))) {
      return;
    }

    await StorageManager.clearToday();
    this.showNotification(i18n.t('popup.notifications.recordsCleared'), 'success');
    this.refreshUI();
    chrome.runtime.sendMessage({ action: 'clearAlarm' });
  }

  showNotification(message, type = 'info') {
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
    this.updateInterval = setInterval(() => {
      this.refreshUI();
    }, 60000);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  async loadSelectorStatus() {
    const config = await StorageManager.get('buttonConfig');
    
    if (config && config.selector) {
      // Use translation for status
      this.elements.selectorStatus.textContent = i18n.t('popup.button.configured');
      this.elements.selectorStatus.className = 'status-value configured';
      
      const displayText = `${i18n.t('popup.button.page')}: ${config.pageTitle || 'N/A'}\n${i18n.t('popup.button.url')}: ${config.pageUrl}\n${i18n.t('popup.button.selector')}: ${config.selector}`;
      this.elements.selectorDisplay.textContent = displayText;
      this.elements.selectorInfo.style.display = 'block';
      this.elements.clearSelector.style.display = 'block';
    } else {
      this.elements.selectorStatus.textContent = i18n.t('popup.button.notConfigured');
      this.elements.selectorStatus.className = 'status-value not-configured';
      this.elements.selectorInfo.style.display = 'none';
      this.elements.clearSelector.style.display = 'none';
    }
  }

  async startButtonPicker() {
    console.log('🚀 [Popup] startButtonPicker() chamado');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        this.showNotification(i18n.t('errors.noTab'), 'error');
        return;
      }

      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        this.showNotification(i18n.t('errors.restrictedPage'), 'error');
        return;
      }

      const isInjected = await this.checkContentScriptInjected(tab.id);
      
      if (!isInjected) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          this.showNotification(i18n.t('errors.injectionFailed'), 'error');
          return;
        }
      }

      chrome.tabs.sendMessage(tab.id, { action: 'startPicker' }, (response) => {
        if (chrome.runtime.lastError) {
          this.showNotification(i18n.t('errors.pickerFailed'), 'error');
          return;
        }

        if (response && response.success) {
          this.showNotification(i18n.t('picker.clickInstruction'), 'info');
          
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          this.showNotification(i18n.t('errors.invalidResponse'), 'error');
        }
      });
    } catch (error) {
      this.showNotification(i18n.t('errors.generalError'), 'error');
    }
  }

  async checkContentScriptInjected(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
        } else {
          resolve(response && response.status === 'active');
        }
      });
    });
  }

  async clearButtonSelector() {
    if (!confirm(i18n.t('confirmations.clearButton'))) {
      return;
    }

    await StorageManager.set('buttonConfig', null);
    this.showNotification(i18n.t('popup.notifications.configRemoved'), 'success');
    await this.loadSelectorStatus();
  }
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  i18n = getI18n();
  const ui = new UIManager();
  await ui.init();
});

window.addEventListener('unload', () => {
  if (window.uiManager) {
    window.uiManager.stopAutoUpdate();
  }
});

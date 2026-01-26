/**
 * @module i18n
 * @description Sistema de internacionalização (i18n)
 * 
 * Suporta múltiplos idiomas com carregamento dinâmico
 * Idioma padrão: pt-BR
 * Idiomas suportados: pt-BR, en-US, es
 */

import { ptBR } from '../locales/pt-BR.js';
import { enUS } from '../locales/en-US.js';
import { es } from '../locales/es.js';

const STORAGE_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE = 'pt-BR';

/**
 * Mapa de traduções disponíveis
 */
const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es': es
};

/**
 * Classe gerenciadora de i18n
 */
export class I18n {
  constructor() {
    this.currentLanguage = DEFAULT_LANGUAGE;
    this.translations = translations;
  }

  /**
   * Inicializa o sistema de i18n
   * Carrega idioma salvo ou usa o padrão
   */
  async init() {
    const savedLanguage = await this.getSavedLanguage();
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
    return this.currentLanguage;
  }

  /**
   * Obtém idioma salvo no storage
   */
  async getSavedLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || DEFAULT_LANGUAGE);
      });
    });
  }

  /**
   * Salva idioma no storage
   */
  async saveLanguage(languageCode) {
    if (!this.translations[languageCode]) {
      console.error(`[i18n] Idioma não suportado: ${languageCode}`);
      return false;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: languageCode }, () => {
        this.currentLanguage = languageCode;
        console.log(`[i18n] Idioma alterado para: ${languageCode}`);
        resolve(true);
      });
    });
  }

  /**
   * Obtém tradução por caminho (ex: 'popup.entries.title')
   * @param {string} path - Caminho da tradução
   * @param {object} params - Parâmetros para interpolação
   * @returns {string} Texto traduzido
   */
  t(path, params = {}) {
    const keys = path.split('.');
    let value = this.translations[this.currentLanguage];

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        console.warn(`[i18n] Tradução não encontrada: ${path}`);
        return path;
      }
    }

    // Interpolação de parâmetros
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return this._interpolate(value, params);
    }

    return value || path;
  }

  /**
   * Interpolação de parâmetros no texto
   * @private
   */
  _interpolate(text, params) {
    let result = text;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Obtém todas as traduções do idioma atual
   */
  getAll() {
    return this.translations[this.currentLanguage];
  }

  /**
   * Obtém código do idioma atual
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Lista todos os idiomas disponíveis
   */
  getAvailableLanguages() {
    return Object.keys(this.translations).map(code => ({
      code,
      name: this.translations[code].language
    }));
  }

  /**
   * Troca o idioma atual
   */
  async changeLanguage(languageCode) {
    const success = await this.saveLanguage(languageCode);
    if (success) {
      // Notifica outras partes da extensão
      chrome.runtime.sendMessage({
        action: 'languageChanged',
        language: languageCode
      }).catch(() => {
        // Ignora erros se background não estiver ouvindo
      });
    }
    return success;
  }
}

/**
 * Instância singleton
 */
let i18nInstance = null;

/**
 * Obtém instância do i18n (singleton)
 */
export function getI18n() {
  if (!i18nInstance) {
    i18nInstance = new I18n();
  }
  return i18nInstance;
}

/**
 * Helper para tradução rápida
 * @param {string} path - Caminho da tradução
 * @param {object} params - Parâmetros opcionais
 */
export function t(path, params) {
  return getI18n().t(path, params);
}

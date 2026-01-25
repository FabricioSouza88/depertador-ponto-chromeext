/**
 * Helper para interagir com chrome.storage de forma consistente
 */

export class StorageHelper {
  /**
   * Verifica se o contexto da extensão está válido
   */
  static isContextValid() {
    return !!chrome.runtime?.id;
  }

  /**
   * Get item from storage
   */
  static async get(key) {
    if (!this.isContextValid()) {
      console.warn('⚠️ [Storage] Contexto inválido');
      return null;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error('❌ [Storage] Erro ao ler:', chrome.runtime.lastError);
            resolve(null);
            return;
          }
          resolve(result[key] ?? null);
        });
      } catch (error) {
        console.error('❌ [Storage] Exceção ao ler:', error);
        resolve(null);
      }
    });
  }

  /**
   * Set item in storage
   */
  static async set(key, value) {
    if (!this.isContextValid()) {
      console.warn('⚠️ [Storage] Contexto inválido');
      return false;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ [Storage] Erro ao salvar:', chrome.runtime.lastError);
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        console.error('❌ [Storage] Exceção ao salvar:', error);
        resolve(false);
      }
    });
  }

  /**
   * Remove item from storage
   */
  static async remove(key) {
    if (!this.isContextValid()) {
      return false;
    }

    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }

  /**
   * Clear all storage
   */
  static async clear() {
    if (!this.isContextValid()) {
      return false;
    }

    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }
}

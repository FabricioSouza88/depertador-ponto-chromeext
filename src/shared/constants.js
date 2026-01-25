/**
 * Constantes compartilhadas entre todos os módulos
 */

export const CONFIG = {
  // Debounce para evitar clicks duplicados
  DEBOUNCE_TIME: 1000,
  
  // Z-index para elementos de UI
  Z_INDEX: {
    OVERLAY: 999998,
    TOOLTIP: 999999
  },
  
  // IDs dos elementos da extensão
  ELEMENT_IDS: {
    OVERLAY: 'despertador-ponto-overlay',
    TOOLTIP: 'despertador-ponto-tooltip'
  },
  
  // Chaves do chrome.storage
  STORAGE_KEYS: {
    BUTTON_CONFIG: 'buttonConfig',
    SETTINGS: 'settings',
    ALARM_INFO: 'alarmInfo',
    NOTIFIED_5MIN: 'notified_5min',
    NOTIFIED_1MIN: 'notified_1min',
    NOTIFIED_EXIT: 'notified_exit'
  },
  
  // Configurações padrão
  DEFAULTS: {
    WORK_HOURS: 8,
    BREAK_MINUTES: 60
  }
};

export const MESSAGES = {
  PICKER: {
    TOOLTIP: '🖱️ CLIQUE no botão que deseja monitorar • ESC para cancelar',
    SUCCESS: 'Botão configurado!',
    ERROR: 'Erro ao gerar seletor. Tente outro elemento.',
    CONTEXT_INVALID: 'Extensão foi recarregada. Recarregue a página (F5) e tente novamente.'
  },
  
  NOTIFICATIONS: {
    REGISTERED: 'Ponto registrado pelo Despertador Ponto!',
    ENTRY_ADDED: 'Entrada adicionada com sucesso',
    SETTINGS_SAVED: 'Configurações salvas com sucesso'
  },
  
  ERRORS: {
    NO_TAB: 'Nenhuma aba ativa encontrada',
    RESTRICTED_PAGE: 'Não é possível selecionar elementos em páginas do Chrome',
    INJECTION_FAILED: 'Erro ao preparar página. Verifique as permissões.',
    PICKER_FAILED: 'Erro ao iniciar seletor. Recarregue a página e tente novamente.'
  }
};

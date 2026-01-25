/**
 * Background Service Worker - Gerencia alarmes e notificações
 * Manifest V3 compatible
 */

// ==================== Configuration ====================
const CONFIG = {
  alarmName: 'despertador-ponto',
  checkInterval: 1, // minutos
  notificationId: 'despertador-ponto-notification'
};

// ==================== Storage Helper ====================
class StorageHelper {
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

  static getTodayKey() {
    const today = new Date();
    return `entries_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  static async getEntriesToday() {
    const today = this.getTodayKey();
    const entries = await this.get(today);
    return entries || [];
  }

  static async getSettings() {
    const settings = await this.get('settings');
    return settings || { workHours: 8, breakMinutes: 60 };
  }
}

// ==================== Alarm Manager ====================
class AlarmManager {
  static async updateAlarm() {
    console.log('🔔 [Background] Atualizando alarme...');

    const entries = await StorageHelper.getEntriesToday();
    const settings = await StorageHelper.getSettings();

    if (!entries || entries.length === 0) {
      console.log('📭 [Background] Sem entradas hoje, limpando alarmes');
      await this.clearAlarm();
      return;
    }

    // Calcula horário de saída
    const exitTime = this.calculateExitTime(entries, settings);
    
    if (!exitTime) {
      console.log('❌ [Background] Não foi possível calcular horário de saída');
      return;
    }

    const now = new Date();
    
    if (exitTime <= now) {
      console.log('⏰ [Background] Horário de saída já passou!');
      await this.showExitNotification();
      return;
    }

    // Cria alarme para o horário de saída
    const delayInMinutes = (exitTime - now) / (1000 * 60);
    
    chrome.alarms.create(CONFIG.alarmName, {
      when: exitTime.getTime()
    });

    console.log(`✅ [Background] Alarme configurado para ${exitTime.toLocaleTimeString('pt-BR')} (em ${Math.round(delayInMinutes)} minutos)`);

    // Salva informações do alarme
    await StorageHelper.set('alarmInfo', {
      exitTime: exitTime.getTime(),
      entries: entries.length,
      settings: settings
    });

    // Configura verificações periódicas
    this.setupPeriodicCheck();
    
    // Limpa flags de notificação para nova entrada
    await StorageHelper.set('notified_5min', false);
    await StorageHelper.set('notified_1min', false);
    await StorageHelper.set('notified_exit', false);
  }

  static calculateExitTime(entries, settings) {
    if (!entries || entries.length === 0) return null;

    const firstEntry = entries[0].timestamp;
    const workHours = settings.workHours || 8;
    const breakMinutes = settings.breakMinutes || 60;

    const exitTime = new Date(firstEntry);
    exitTime.setHours(exitTime.getHours() + workHours);
    exitTime.setMinutes(exitTime.getMinutes() + breakMinutes);

    return exitTime;
  }

  static async clearAlarm() {
    chrome.alarms.clear(CONFIG.alarmName);
    await StorageHelper.set('alarmInfo', null);
    console.log('🗑️ [Background] Alarmes limpos');
  }

  static setupPeriodicCheck() {
    // Cria um alarme que verifica a cada minuto se está perto da hora
    chrome.alarms.create('periodic-check', {
      periodInMinutes: CONFIG.checkInterval
    });
  }

  static async showExitNotification() {
    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏰ Hora de Bater o Ponto!',
      message: 'Está na hora de registrar sua saída. Não esqueça!',
      priority: 2,
      requireInteraction: true,
      buttons: [
        { title: '✅ Já bati o ponto' },
        { title: '⏰ Lembrar em 5 min' }
      ]
    };

    chrome.notifications.create(CONFIG.notificationId, options);
    
    // Toca som do sistema (se permitido)
    this.playNotificationSound();
  }

  static async showWarningNotification(minutesRemaining) {
    console.log(`🔔 [Background] showWarningNotification() chamada para ${minutesRemaining} minutos`);
    
    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏰ Despertador Ponto - ATENÇÃO',
      message: `⚠️ Faltam ${minutesRemaining} minutos para o horário de saída!\n\nNão esqueça de bater o ponto!`,
      priority: 2,  // Prioridade ALTA (era 1)
      requireInteraction: true,  // Não desaparece sozinha
      silent: false  // Com som
    };

    const notificationId = 'warning-' + Date.now();
    console.log(`📢 [Background] Criando notificação ID: ${notificationId}`);
    
    chrome.notifications.create(notificationId, options, (notifId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ [Background] Erro ao criar notificação:', chrome.runtime.lastError);
      } else {
        console.log(`✅ [Background] Notificação criada com sucesso: ${notifId}`);
        
        // Log adicional: verifica se notificação realmente existe
        setTimeout(() => {
          chrome.notifications.getAll((notifications) => {
            if (notifications[notifId]) {
              console.log(`✅ [Background] Notificação ${notifId} confirmada como ativa`);
            } else {
              console.warn(`⚠️ [Background] Notificação ${notifId} não encontrada (pode ter sido fechada)`);
            }
          });
        }, 1000);
      }
    });
  }

  static playNotificationSound() {
    // Service workers não podem tocar áudio diretamente
    // Mas podemos criar uma notificação que o sistema toca
    console.log('🔊 [Background] Notificação sonora do sistema');
  }
}

// ==================== Event Listeners ====================

// Inicialização da extensão
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 [Background] Extensão instalada/atualizada', details.reason);
  
  if (details.reason === 'install') {
    // Configurações padrão
    StorageHelper.set('settings', {
      workHours: 8,
      breakMinutes: 60
    });
  }
});

// Listener para alarmes
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('⏰ [Background] Alarme disparado:', alarm.name);

  if (alarm.name === CONFIG.alarmName) {
    // Alarme principal - hora de sair
    console.log('🔔 [Background] Executando alarme principal de saída');
    await AlarmManager.showExitNotification();
    await StorageHelper.set('notified_exit', true);
  } else if (alarm.name === 'periodic-check') {
    // Verificação periódica
    console.log('🔍 [Background] Executando verificação periódica');
    await checkUpcomingExit();
  } else if (alarm.name === 'reminder-5min') {
    // Lembrete adiado
    await AlarmManager.showExitNotification();
    await StorageHelper.set('notified_exit', true);
  }
});

// Verifica se está próximo da hora de saída
async function checkUpcomingExit() {
  console.log('🔄 [Background] checkUpcomingExit() chamada');
  
  const alarmInfo = await StorageHelper.get('alarmInfo');
  console.log('📦 [Background] alarmInfo:', alarmInfo);
  
  if (!alarmInfo?.exitTime) {
    console.log('⚠️ [Background] Sem alarmInfo ou exitTime definido');
    return;
  }

  const exitTime = new Date(alarmInfo.exitTime);
  const now = new Date();
  const minutesRemaining = Math.round((exitTime - now) / (1000 * 60));

  console.log(`🔍 [Background] Verificando: faltam ${minutesRemaining} minutos`);

  // Notifica 5 minutos antes (aceita range de 4-6 min)
  if (minutesRemaining >= 4 && minutesRemaining <= 6) {
    const notified5 = await StorageHelper.get('notified_5min');
    if (!notified5) {
      console.log('📢 [Background] Enviando notificação de 5 minutos');
      await AlarmManager.showWarningNotification(5);
      await StorageHelper.set('notified_5min', true);
    }
  }

  // Notifica 1 minuto antes (aceita range de 1-2 min)
  if (minutesRemaining >= 1 && minutesRemaining <= 2) {
    const notified1 = await StorageHelper.get('notified_1min');
    if (!notified1) {
      console.log('📢 [Background] Enviando notificação de 1 minuto');
      await AlarmManager.showWarningNotification(1);
      await StorageHelper.set('notified_1min', true);
    }
  }

  // Garante notificação na hora de sair via periodic-check
  if (minutesRemaining <= 0) {
    const notifiedExit = await StorageHelper.get('notified_exit');
    if (!notifiedExit) {
      console.log('⏰ [Background] Enviando notificação de saída (periodic-check)');
      await AlarmManager.showExitNotification();
      await StorageHelper.set('notified_exit', true);
    }
  }
  
  // Limpa flags de notificação para o próximo dia
  if (minutesRemaining > 16) {
    await StorageHelper.set('notified_5min', false);
    await StorageHelper.set('notified_1min', false);
    await StorageHelper.set('notified_exit', false);
  }
}

// Listener para notificações
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId === CONFIG.notificationId) {
    if (buttonIndex === 0) {
      // Usuário confirmou que bateu o ponto
      chrome.notifications.clear(notificationId);
    } else if (buttonIndex === 1) {
      // Lembrar em 5 minutos
      chrome.notifications.clear(notificationId);
      chrome.alarms.create('reminder-5min', {
        delayInMinutes: 5
      });
    }
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  // Abre o popup da extensão
  chrome.action.openPopup();
  chrome.notifications.clear(notificationId);
});

// Listener para mensagens do content script e popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 [Background] Mensagem recebida:', request);

  if (request.action === 'updateAlarm') {
    AlarmManager.updateAlarm().then(() => {
      sendResponse({ success: true });
    });
    return true; // Mantém o canal aberto para resposta assíncrona
  }

  if (request.action === 'clearAlarm') {
    AlarmManager.clearAlarm().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'showNotification') {
    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: request.title || 'Despertador Ponto',
      message: request.message || '',
      priority: 0
    };

    chrome.notifications.create('info-' + Date.now(), options);
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getAlarmInfo') {
    StorageHelper.get('alarmInfo').then((alarmInfo) => {
      sendResponse({ alarmInfo });
    });
    return true;
  }
});

// Atualiza alarme quando o dia muda (meia-noite)
function scheduleNextDayReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  
  const msUntilMidnight = midnight - now;
  
  setTimeout(() => {
    console.log('🌙 [Background] Novo dia iniciado, limpando alarmes');
    AlarmManager.clearAlarm();
    scheduleNextDayReset(); // Agenda para o próximo dia
  }, msUntilMidnight);
}

scheduleNextDayReset();

// Garante que o periodic check está sempre ativo
chrome.runtime.onStartup.addListener(() => {
  console.log('🌅 [Background] Chrome iniciado, verificando alarmes');
  chrome.alarms.get('periodic-check', (alarm) => {
    if (!alarm) {
      console.log('🔄 [Background] Recriando periodic-check');
      chrome.alarms.create('periodic-check', {
        periodInMinutes: 1
      });
    }
  });
});

// Também verifica quando o service worker acorda
chrome.alarms.get('periodic-check', (alarm) => {
  if (!alarm) {
    console.log('🔄 [Background] Criando periodic-check inicial');
    chrome.alarms.create('periodic-check', {
      periodInMinutes: 1
    });
  }
});

console.log('✅ [Background] Service Worker inicializado');

/**
 * Background Service Worker - Gerencia alarmes e notificações
 * Manifest V3 compatible
 */

// ==================== Configuration ====================
const CONFIG = {
  alarmName: 'despertador-ponto',
  checkInterval: 1, // minutos
  notificationId: 'despertador-ponto-notification',
  entryReminderAlarm: 'entry-reminder-check',
  entryReminderDelay: 5 // minutos após a hora habitual
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
    const selectedLanguage = await StorageHelper.get('selectedLanguage') || 'pt-BR';
    const buttonTexts = await this.getButtonTranslations(selectedLanguage);
    
    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏰ Hora de Bater o Ponto!',
      message: 'Está na hora de registrar sua saída. Não esqueça!',
      priority: 2,
      requireInteraction: true,
      buttons: [
        { title: buttonTexts.openSystem },
        { title: buttonTexts.alreadyPunched }
      ]
    };

    chrome.notifications.create(CONFIG.notificationId, options);
    
    // Toca som do sistema (se permitido)
    this.playNotificationSound();
  }

  static async showWarningNotification(minutesRemaining) {
    console.log(`🔔 [Background] showWarningNotification() chamada para ${minutesRemaining} minutos`);
    
    const selectedLanguage = await StorageHelper.get('selectedLanguage') || 'pt-BR';
    const buttonTexts = await this.getButtonTranslations(selectedLanguage);
    
    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏰ Despertador Ponto - ATENÇÃO',
      message: `⚠️ Faltam ${minutesRemaining} minutos para o horário de saída!\n\nNão esqueça de bater o ponto!`,
      priority: 2,  // Prioridade ALTA (era 1)
      requireInteraction: true,  // Não desaparece sozinha
      silent: false,  // Com som
      buttons: [
        { title: buttonTexts.openSystem },
        { title: buttonTexts.remindLater }
      ]
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

  static async checkAndRemindEntry() {
    console.log('🔍 [Background] Verificando necessidade de lembrete de entrada');
    
    // Obter configurações
    const settings = await StorageHelper.get('settings');
    if (!settings || !settings.usualEntryTime) {
      console.log('⏭️ [Background] Sem horário de entrada habitual configurado');
      return;
    }

    // Verificar se já tem entrada hoje
    const todayKey = StorageHelper.getTodayKey();
    const entries = await StorageHelper.get(todayKey);
    if (entries && entries.length > 0) {
      console.log('✅ [Background] Já tem entrada registrada hoje');
      return;
    }

    // Verificar se já passou 5 minutos do horário habitual
    const now = new Date();
    const [hours, minutes] = settings.usualEntryTime.split(':');
    const usualTime = new Date();
    usualTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = now - usualTime;
    const minutesDiff = timeDiff / (1000 * 60);

    console.log(`⏰ [Background] Horário habitual: ${settings.usualEntryTime}, Diferença: ${minutesDiff.toFixed(0)} minutos`);

    // Se passaram mais de 5 minutos do horário habitual
    if (minutesDiff >= CONFIG.entryReminderDelay) {
      // Verificar se já enviou lembrete hoje
      const reminderSentKey = `entry-reminder-sent-${todayKey}`;
      const reminderSent = await StorageHelper.get(reminderSentKey);
      
      if (!reminderSent) {
        console.log('🔔 [Background] Enviando lembrete de entrada');
        await this.showEntryReminder();
        await StorageHelper.set(reminderSentKey, true);
      } else {
        console.log('⏭️ [Background] Lembrete já foi enviado hoje');
      }
    } else {
      console.log('⏭️ [Background] Ainda não passou 5 minutos do horário habitual');
    }
  }

  static async showEntryReminder() {
    // Obter idioma atual para notificação traduzida
    const selectedLanguage = await StorageHelper.get('selectedLanguage') || 'pt-BR';
    const buttonTexts = await this.getButtonTranslations(selectedLanguage);
    
    // Traduções simples (já que não temos acesso ao i18n aqui)
    const translations = {
      'pt-BR': {
        title: 'Hora de bater o ponto! ⏰',
        message: 'Você ainda não registrou sua entrada de hoje. Não esqueça de bater o ponto!'
      },
      'en-US': {
        title: 'Time to clock in! ⏰',
        message: 'You haven\'t clocked in yet today. Don\'t forget to punch in!'
      },
      'es': {
        title: '¡Hora de fichar! ⏰',
        message: 'Aún no ha registrado su entrada de hoy. ¡No olvide fichar!'
      }
    };

    const text = translations[selectedLanguage] || translations['pt-BR'];

    const options = {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: text.title,
      message: text.message,
      priority: 2,
      requireInteraction: true,
      silent: false,
      buttons: [
        { title: buttonTexts.openSystem }
      ]
    };

    const notificationId = 'entry-reminder-' + Date.now();
    chrome.notifications.create(notificationId, options);
    console.log('✅ [Background] Lembrete de entrada enviado');
  }

  static async getButtonTranslations(language) {
    const translations = {
      'pt-BR': {
        openSystem: '🌐 Abrir Sistema',
        alreadyPunched: '✅ Já bati',
        remindLater: '⏰ Lembrar em 5min'
      },
      'en-US': {
        openSystem: '🌐 Open System',
        alreadyPunched: '✅ Done',
        remindLater: '⏰ Remind in 5min'
      },
      'es': {
        openSystem: '🌐 Abrir Sistema',
        alreadyPunched: '✅ Listo',
        remindLater: '⏰ Recordar en 5min'
      }
    };
    
    return translations[language] || translations['pt-BR'];
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
      breakMinutes: 60,
      usualEntryTime: '08:00'
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
    await AlarmManager.checkAndRemindEntry();
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
  console.log(`🔔 [Background] Botão clicado - Notificação: ${notificationId}, Botão: ${buttonIndex}`);
  
  // Botão 0 em todas notificações = "Abrir Sistema"
  if (buttonIndex === 0) {
    const config = await StorageHelper.get('buttonConfig');
    if (config && config.pageUrl) {
      console.log('🌐 [Background] Abrindo sistema de ponto:', config.pageUrl);
      chrome.tabs.create({ url: config.pageUrl });
      chrome.notifications.clear(notificationId);
    } else {
      console.warn('⚠️ [Background] Nenhuma URL configurada para abrir');
    }
    return;
  }
  
  // Tratamento específico para notificação principal de saída
  if (notificationId === CONFIG.notificationId) {
    if (buttonIndex === 1) {
      // Botão "Já bati o ponto"
      console.log('✅ [Background] Usuário confirmou que bateu o ponto');
      await StorageHelper.set('notified_exit', true);
      chrome.notifications.clear(notificationId);
    }
  }
  
  // Tratamento para notificações de aviso (warning-*)
  if (notificationId.startsWith('warning-')) {
    if (buttonIndex === 1) {
      // Botão "Lembrar em 5 min"
      console.log('⏰ [Background] Usuário solicitou lembrete em 5 min');
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

  if (request.type === 'settings-updated') {
    // Configurações foram atualizadas, limpar flag de lembrete para permitir novo lembrete
    const todayKey = StorageHelper.getTodayKey();
    const reminderSentKey = `entry-reminder-sent-${todayKey}`;
    StorageHelper.set(reminderSentKey, false).then(() => {
      console.log('✅ [Background] Flag de lembrete de entrada resetada');
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

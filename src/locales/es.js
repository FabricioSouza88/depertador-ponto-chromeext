/**
 * Traducciones en Español
 */

export const es = {
  // Información general
  language: 'Español',
  code: 'es',

  // Popup - Encabezado
  popup: {
    title: 'Alarma de Fichaje',
    subtitle: '¡Nunca más olvide fichar la salida!',
    today: 'Hoy',
    
    // Sección de Entradas
    entries: {
      title: 'Entradas de Hoy',
      empty: 'No hay entradas registradas hoy',
      automatic: 'Automático',
      manual: 'Manual',
      remove: 'Eliminar',
      addManual: 'Agregar entrada manual',
      timePlaceholder: 'Seleccionar hora',
      add: 'Agregar'
    },

    // Sección de Hora de Salida
    exit: {
      title: 'Hora de Salida',
      programmed: 'Programado para',
      remaining: 'Tiempo Restante',
      noEntries: 'No hay entradas registradas',
      timeToLeave: '¡Hora de salir! 🎉',
      calculate: 'Calcular desde Ahora'
    },

    // Sección de Configuración
    settings: {
      title: 'Configuración',
      workHours: 'Horas de Trabajo',
      workHoursUnit: 'horas',
      breakMinutes: 'Descanso (min)',
      breakMinutesUnit: 'minutos',
      save: 'Guardar Configuración',
      clearToday: 'Limpiar Registros de Hoy'
    },

    // Sección de Botón de Fichaje
    button: {
      title: 'Botón de Fichaje',
      tooltip: 'Configure el botón de fichaje de su sistema online. Haga clic en "Seleccionar Botón" y luego haga clic en el botón de fichaje en la página de su sistema. La extensión detectará automáticamente cuando registre entrada o salida.',
      status: 'Estado',
      configured: 'Botón configurado',
      notConfigured: 'No configurado',
      page: 'Página',
      url: 'URL',
      selector: 'Selector',
      select: 'Seleccionar Botón en la Página',
      clear: 'Limpiar Selección'
    },

    // Sección de Idioma
    language: {
      title: 'Idioma',
      label: 'Elegir idioma',
      portuguese: 'Português (Brasil)',
      english: 'English (USA)',
      spanish: 'Español'
    },

    // Notificaciones
    notifications: {
      entryAdded: '¡Entrada agregada con éxito!',
      entryRemoved: 'Entrada eliminada',
      settingsSaved: '¡Configuración guardada con éxito!',
      recordsCleared: 'Registros limpiados',
      buttonConfigured: '¡Botón configurado!',
      configRemoved: 'Configuración eliminada',
      selectTime: 'Por favor, seleccione una hora',
      languageChanged: '¡Idioma cambiado con éxito!'
    }
  },

  // Content Script - Selector de Elementos
  picker: {
    tooltip: '🖱️ HAGA CLIC en el botón que desea monitorear • ESC para cancelar',
    success: '¡Botón configurado con éxito!',
    error: 'Error al generar selector. Intente con otro elemento.',
    contextInvalid: 'La extensión fue recargada. Recargue la página (F5) e intente nuevamente.',
    clickInstruction: 'HAGA CLIC en el botón que desea monitorear'
  },

  // Notificaciones del sistema
  systemNotifications: {
    registered: '¡Fichaje registrado por Alarma de Fichaje!',
    exitTime: '¡Hora de fichar la salida!',
    warning5min: '¡Faltan 5 minutos para fichar!',
    warning1min: '¡Falta 1 minuto para fichar!',
    remind5min: 'Recordar en 5 minutos',
    dismiss: 'Descartar'
  },

  // Errores
  errors: {
    noTab: 'No se encontró ninguna pestaña activa',
    restrictedPage: 'No se pueden seleccionar elementos en páginas de Chrome',
    injectionFailed: 'Error al preparar la página. Verifique los permisos.',
    pickerFailed: 'Error al iniciar el selector. Recargue la página e intente nuevamente.',
    invalidResponse: 'Error: respuesta inválida del content script',
    generalError: 'Error al iniciar el selector'
  },

  // Confirmaciones
  confirmations: {
    clearRecords: '¿Está seguro de que desea limpiar todos los registros de hoy?',
    clearButton: '¿Está seguro de que desea eliminar la configuración del botón?\n\nDeberá configurarlo nuevamente para usar la extensión.'
  }
};

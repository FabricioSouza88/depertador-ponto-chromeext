/**
 * English (United States) Translations
 */

export const enUS = {
  // General information
  language: 'English (USA)',
  code: 'en-US',

  // Popup - Header
  popup: {
    title: 'Clock Alarm',
    subtitle: 'Never forget to clock out again!',
    today: 'Today',
    
    // Entries Section
    entries: {
      title: "Today's Entries",
      empty: 'No entries recorded today',
      automatic: 'Automatic',
      manual: 'Manual',
      remove: 'Remove',
      addManual: 'Add manual entry',
      timePlaceholder: 'Select time',
      add: 'Add'
    },

    // Exit Time Section
    exit: {
      title: 'Exit Time',
      programmed: 'Scheduled for',
      remaining: 'Time Remaining',
      noEntries: 'No entries recorded',
      timeToLeave: 'Time to leave! 🎉',
      calculate: 'Calculate from Now'
    },

    // Settings Section
    settings: {
      title: 'Settings',
      workHours: 'Work Hours',
      workHoursUnit: 'hours',
      breakMinutes: 'Break (min)',
      breakMinutesUnit: 'minutes',
      save: 'Save Settings',
      clearToday: "Clear Today's Records"
    },

    // Clock Button Section
    button: {
      title: 'Clock Button',
      status: 'Status',
      configured: 'Button configured',
      notConfigured: 'Not configured',
      page: 'Page',
      url: 'URL',
      selector: 'Selector',
      select: 'Select Button on Page',
      clear: 'Clear Selection'
    },

    // Language Section
    language: {
      title: 'Language',
      label: 'Choose language',
      portuguese: 'Português (Brasil)',
      english: 'English (USA)',
      spanish: 'Español'
    },

    // Notifications
    notifications: {
      entryAdded: 'Entry added successfully!',
      entryRemoved: 'Entry removed',
      settingsSaved: 'Settings saved successfully!',
      recordsCleared: 'Records cleared',
      buttonConfigured: 'Button configured!',
      configRemoved: 'Configuration removed',
      selectTime: 'Please select a time',
      languageChanged: 'Language changed successfully!'
    }
  },

  // Content Script - Element Picker
  picker: {
    tooltip: '🖱️ CLICK on the button you want to monitor • ESC to cancel',
    success: 'Button configured successfully!',
    error: 'Error generating selector. Try another element.',
    contextInvalid: 'Extension was reloaded. Reload the page (F5) and try again.',
    clickInstruction: 'CLICK on the button you want to monitor'
  },

  // System Notifications
  systemNotifications: {
    registered: 'Time registered by Clock Alarm!',
    exitTime: 'Time to clock out!',
    warning5min: '5 minutes until clock out time!',
    warning1min: '1 minute until clock out time!',
    remind5min: 'Remind in 5 minutes',
    dismiss: 'Dismiss'
  },

  // Errors
  errors: {
    noTab: 'No active tab found',
    restrictedPage: 'Cannot select elements on Chrome pages',
    injectionFailed: 'Error preparing page. Check permissions.',
    pickerFailed: 'Error starting selector. Reload page and try again.',
    invalidResponse: 'Error: invalid response from content script',
    generalError: 'Error starting selector'
  },

  // Confirmations
  confirmations: {
    clearRecords: 'Are you sure you want to clear all records for today?',
    clearButton: 'Are you sure you want to remove the button configuration?\n\nYou will need to configure it again to use the extension.'
  }
};

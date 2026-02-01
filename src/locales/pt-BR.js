/**
 * Traduções em Português Brasileiro (pt-BR)
 * Idioma padrão da extensão
 */

export const ptBR = {
  // Informações gerais
  language: 'Português (Brasil)',
  code: 'pt-BR',

  // Popup - Cabeçalho
  popup: {
    title: 'Despertador Ponto',
    subtitle: 'Nunca mais esqueça de bater o ponto!',
    today: 'Hoje',
    
    // Seção de Entradas
    entries: {
      title: 'Entradas de Hoje',
      empty: 'Nenhuma entrada registrada hoje',
      automatic: 'Automático',
      manual: 'Manual',
      remove: 'Remover',
      addManual: 'Adicionar entrada manual',
      timePlaceholder: 'Selecione o horário',
      add: 'Adicionar'
    },

    // Seção de Horário de Saída
    exit: {
      title: 'Horário de Saída',
      programmed: 'Programado para',
      remaining: 'Tempo Restante',
      noEntries: 'Nenhuma entrada registrada',
      timeToLeave: 'Hora de sair! 🎉',
      calculate: 'Calcular do Agora'
    },

    // Seção de Configurações
    settings: {
      title: 'Configurações',
      workHours: 'Horas de Trabalho',
      workHoursUnit: 'horas',
      breakMinutes: 'Intervalo (min)',
      breakMinutesUnit: 'minutos',
      save: 'Salvar Configurações',
      clearToday: 'Limpar Registros de Hoje'
    },

    // Seção de Botão de Ponto
    button: {
      title: 'Botão de Ponto',
      tooltip: 'Configure o botão de ponto do seu sistema online. Clique em "Selecionar Botão" e depois clique no botão de ponto na página do seu sistema. A extensão detectará automaticamente quando você bater o ponto.',
      status: 'Status',
      configured: 'Botão configurado',
      notConfigured: 'Não configurado',
      page: 'Página',
      url: 'URL',
      selector: 'Selector',
      select: 'Selecionar Botão na Página',
      clear: 'Limpar Seleção'
    },

    // Seção de Idioma
    language: {
      title: 'Idioma',
      label: 'Escolha o idioma',
      portuguese: 'Português (Brasil)',
      english: 'English (USA)',
      spanish: 'Español'
    },

    // Notificações
    notifications: {
      entryAdded: 'Entrada adicionada com sucesso!',
      entryRemoved: 'Entrada removida',
      settingsSaved: 'Configurações salvas com sucesso!',
      recordsCleared: 'Registros limpos',
      buttonConfigured: 'Botão configurado!',
      configRemoved: 'Configuração removida',
      selectTime: 'Por favor, selecione um horário',
      languageChanged: 'Idioma alterado com sucesso!'
    }
  },

  // Content Script - Element Picker
  picker: {
    tooltip: '🖱️ CLIQUE no botão que deseja monitorar • ESC para cancelar',
    success: 'Botão configurado com sucesso!',
    error: 'Erro ao gerar seletor. Tente outro elemento.',
    contextInvalid: 'Extensão foi recarregada. Recarregue a página (F5) e tente novamente.',
    clickInstruction: 'CLIQUE no botão que deseja monitorar'
  },

  // Notificações do sistema
  systemNotifications: {
    registered: 'Ponto registrado pelo Despertador Ponto!',
    exitTime: 'Hora de bater o ponto de saída!',
    warning5min: 'Faltam 5 minutos para bater o ponto!',
    warning1min: 'Faltam 1 minuto para bater o ponto!',
    remind5min: 'Lembrar em 5 minutos',
    dismiss: 'Dispensar'
  },

  // Erros
  errors: {
    noTab: 'Nenhuma aba ativa encontrada',
    restrictedPage: 'Não é possível selecionar elementos em páginas do Chrome',
    injectionFailed: 'Erro ao preparar página. Verifique as permissões.',
    pickerFailed: 'Erro ao iniciar seletor. Recarregue a página e tente novamente.',
    invalidResponse: 'Erro: resposta inválida do content script',
    generalError: 'Erro ao iniciar seletor'
  },

  // Confirmações
  confirmations: {
    clearRecords: 'Tem certeza que deseja limpar todos os registros de hoje?',
    clearButton: 'Tem certeza que deseja remover a configuração do botão?\n\nVocê precisará configurar novamente para usar a extensão.'
  }
};

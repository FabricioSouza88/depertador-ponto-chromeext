# ⏰ Despertador Ponto

Extensão do Google Chrome para controlar e lembrar horários de batida de ponto online, com integração ao sistema Ahgora.

## 🎯 Funcionalidades

- ✅ **Registro Automático**: Detecta automaticamente quando você bate o ponto na página do Ahgora
- ⏱️ **Múltiplas Entradas**: Suporta múltiplas marcações no mesmo dia
- 🔔 **Alertas Inteligentes**: Notificações quando chegar a hora de bater o ponto de saída
- 📊 **Cálculo Automático**: Calcula automaticamente o horário de saída baseado na entrada
- ⚙️ **Configurável**: Defina suas horas de trabalho e tempo de intervalo
- 📝 **Entrada Manual**: Adicione registros manualmente quando necessário
- 🎨 **Interface Moderna**: Design limpo e intuitivo

## 📋 Pré-requisitos

- Google Chrome (ou navegador baseado em Chromium)
- Node.js (opcional, apenas para gerar ícones)

## 🚀 Instalação

### Passo 1: Preparar a Extensão

1. Clone ou baixe este repositório:
```bash
git clone https://github.com/seu-usuario/despertador-ponto.git
cd despertador-ponto
```

### Passo 2: Gerar Ícones (Opcional)

A extensão precisa de ícones PNG. Você tem três opções:

**Opção A: Usando Node.js (Recomendado)**
```bash
npm install
npm run generate-icons
```

**Opção B: Converter manualmente**
- Acesse: https://cloudconvert.com/svg-to-png
- Converta `icons/icon.svg` para os tamanhos: 16x16, 32x32, 48x48, 128x128
- Salve como: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` na pasta `icons/`

**Opção C: Usar ícones temporários**
- A extensão funcionará sem ícones, mas mostrará um ícone padrão do Chrome

### Passo 3: Instalar no Chrome

1. Abra o Chrome e acesse: `chrome://extensions/`

2. Ative o **Modo do desenvolvedor** (canto superior direito)

3. Clique em **Carregar sem compactação**

4. Selecione a pasta do projeto `despertador-ponto`

5. A extensão será instalada e aparecerá na barra de ferramentas! 🎉

## 📖 Como Usar

### 1. Registro Automático

1. Acesse: https://app.ahgora.com.br/novabatidaonline/?defaultDevice=a208444

2. Clique no botão de "Clocking in" para bater o ponto

3. A extensão detectará automaticamente e registrará a entrada! ✨

4. Uma notificação aparecerá confirmando o registro

### 2. Visualizar Registros

1. Clique no ícone da extensão na barra de ferramentas

2. O popup mostrará:
   - Data atual
   - Lista de todas as entradas do dia
   - Horário estimado de saída
   - Tempo restante até a saída
   - Barra de progresso

### 3. Adicionar Entrada Manual

1. Abra o popup da extensão

2. Na seção "Entrada Manual":
   - Selecione o horário
   - Clique em **Adicionar**

3. A entrada será registrada e o horário de saída recalculado

### 4. Configurar Horários

1. Abra o popup da extensão

2. Na seção "Configurações":
   - **Horas de trabalho**: Defina quantas horas você trabalha por dia (ex: 8)
   - **Intervalo**: Defina o tempo de intervalo em minutos (ex: 60)

3. Clique em **Salvar**

4. Os cálculos serão atualizados automaticamente

### 5. Notificações

A extensão enviará notificações nos seguintes momentos:

- ⏰ **15 minutos antes** do horário de saída (aviso)
- ⏰ **5 minutos antes** do horário de saída (aviso)
- 🔔 **No horário exato** de saída (alarme principal)

Você pode:
- Clicar em "Já bati o ponto" para dispensar
- Clicar em "Lembrar em 5 min" para ser avisado novamente

## ⚙️ Configurações

### Permissões Utilizadas

- **storage**: Para salvar registros e configurações localmente
- **alarms**: Para criar lembretes e notificações programadas
- **notifications**: Para mostrar alertas na área de notificações
- **host_permissions** (app.ahgora.com.br): Para detectar cliques na página

### Estrutura do Projeto

```
despertador-ponto/
├── manifest.json          # Configuração da extensão
├── popup.html            # Interface do popup
├── popup.css             # Estilos do popup
├── popup.js              # Lógica do popup
├── content.js            # Script injetado na página Ahgora
├── background.js         # Service worker (alarmes)
├── package.json          # Dependências Node.js
├── icons/                # Ícones da extensão
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # Este arquivo
```

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas

- **Manifest V3**: Versão mais recente das extensões Chrome
- **Chrome Storage API**: Armazenamento local
- **Chrome Alarms API**: Agendamento de notificações
- **Chrome Notifications API**: Notificações do sistema
- **Content Scripts**: Integração com páginas web
- **Service Workers**: Processos em background

### Boas Práticas Implementadas

- ✅ Arquitetura modular e organizada
- ✅ Classes e métodos bem documentados
- ✅ Tratamento de erros
- ✅ Código limpo e legível
- ✅ Debounce para evitar clicks duplicados
- ✅ Feedback visual para o usuário
- ✅ Responsividade e UX moderna

### Debug e Logs

Para visualizar logs da extensão:

1. **Popup**: Clique com botão direito no popup > Inspecionar
2. **Background**: Acesse `chrome://extensions/` > Detalhes da extensão > Inspecionar visualizações
3. **Content Script**: F12 na página do Ahgora > Console

Os logs são prefixados com `[Despertador Ponto]` para fácil identificação.

## 🐛 Troubleshooting

### A extensão não detecta o clique no botão

1. Verifique se você está na URL correta: `https://app.ahgora.com.br/novabatidaonline/`
2. Recarregue a página
3. Abra o Console (F12) e procure por erros
4. Verifique se o botão tem as classes CSS corretas

### As notificações não aparecem

1. Verifique as permissões de notificação do Chrome:
   - Configurações > Privacidade e segurança > Configurações do site > Notificações
2. Certifique-se de que as notificações estão ativadas para o Chrome
3. Verifique se o "Não perturbe" está desativado no sistema

### Os registros não aparecem

1. Abra o DevTools do popup
2. Verifique o `chrome.storage.local`:
   ```javascript
   chrome.storage.local.get(null, console.log)
   ```
3. Verifique se há erros no console

### Recalcular horário de saída

1. Faça alterações nas configurações (horas de trabalho ou intervalo)
2. Clique no botão "Recalcular"
3. Ou adicione/remova entradas para forçar o recálculo

## 📝 Funcionalidades Futuras

Ideias para próximas versões:

- [ ] Histórico de registros dos últimos 30 dias
- [ ] Exportar relatório em CSV/PDF
- [ ] Integração com Google Calendar
- [ ] Suporte a múltiplos sistemas de ponto (não apenas Ahgora)
- [ ] Estatísticas de horas trabalhadas
- [ ] Dark mode
- [ ] Sincronização entre dispositivos
- [ ] Sons personalizados para notificações

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o controle de ponto online.

## 🙏 Agradecimentos

- Material-UI pelos componentes visuais inspiradores
- Chrome Extensions documentation
- Comunidade open source

---

**⚠️ Aviso**: Esta é uma extensão não oficial e não tem vínculo com a Ahgora ou qualquer sistema de ponto eletrônico. Use por sua conta e risco.

**💡 Dica**: Não esqueça de dar uma ⭐ no projeto se ele foi útil para você!

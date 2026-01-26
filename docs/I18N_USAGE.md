# 🌐 Como Usar o Sistema de Idiomas

## Para Usuários

### Trocar o Idioma

1. Abra a extensão clicando no ícone
2. Role até a seção **🌐 Idioma**
3. Selecione o idioma desejado no menu dropdown:
   - 🇧🇷 Português (Brasil)
   - 🇺🇸 English (USA)
   - 🇪🇸 Español
4. A interface será atualizada imediatamente
5. Sua preferência será salva automaticamente

### Idiomas Disponíveis

#### Português (Brasil) 🇧🇷
- Idioma padrão da extensão
- Totalmente traduzido
- Datas no formato brasileiro

#### English (USA) 🇺🇸  
- Tradução completa para inglês americano
- Datas no formato americano
- Terminologia profissional

#### Español 🇪🇸
- Tradução completa para espanhol
- Datas no formato espanhol
- Terminologia profissional

## Para Desenvolvedores

### Usar Traduções no Código

```javascript
// Importar sistema de i18n
import { getI18n } from './src/shared/i18n.js';

// Obter instância
const i18n = getI18n();
await i18n.init();

// Usar tradução
const text = i18n.t('popup.entries.title');
```

### Adicionar Novo Texto

1. Adicionar nos arquivos de tradução (`src/locales/`)
2. Usar no código: `i18n.t('chave.do.texto')`
3. Ou no HTML: `<span data-i18n="chave.do.texto">Texto</span>`

Ver [I18N_GUIDE.md](I18N_GUIDE.md) para detalhes completos.

## FAQ

### Como o idioma é salvo?

O idioma escolhido é salvo em `chrome.storage.local` e persiste mesmo após fechar o navegador.

### Posso sugerir correções nas traduções?

Sim! Abra uma issue no GitHub com a correção sugerida.

### Como adicionar um novo idioma?

Ver o guia completo em [I18N_GUIDE.md](I18N_GUIDE.md#-adicionar-novo-idioma).

### O idioma afeta as notificações do sistema?

Sim! Todas as notificações serão exibidas no idioma selecionado.

### Preciso recarregar a extensão ao trocar o idioma?

Não! A interface é atualizada instantaneamente ao trocar o idioma.

---

**Versão**: 2.0.0

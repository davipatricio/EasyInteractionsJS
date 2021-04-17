# EasyInteractionsJS
Responda a interações e Slash Commands facilmente, sem ter que recriar todos os comandos de seu bot.

Para criar Slash Commands facilmente e interativamente, [clique aqui](https://slash-commands-gui.netlify.app/).

## Recursos
 - Argumentos
 - Verificação de permissões
 - Detecta se o bot está no servidor
 - Detecta se o comando usado foi na DM
 - Suporte a argumentos com escolhas
 - Desenvolvido na última versão do Discord.js (v12.5.3)
 - Menções são organizadas automaticamente no Message.mentions
 - ACK na interação "Bot está pensando" (ideal para comandos que demoram para ser executados, como edição de imagem)
 - Sem bugs?

## Implementação
Crie um arquivo na pasta de seu bot, em um diretório de fácil acesso. Para facilitar, coloque o arquivo na mesma pasta onde o arquivo de inicialização do seu bot está presente. Vamos dar o nome de `SlashCommands.js`.

No arquivo de inicialização de seu bot, após a criação do client, dê um require no arquivo criado, passando o cliente como argumento, de preferencia no evento READY.

**Exemplo básico:**

```javascript
const { Client } = require('discord.js');
const client = new Client();

client.login('Token');

client.once('ready', () =>
     require('./SlashCommands')(client)
)
// ... resto de seu código
```

e pronto!

Se você for utilizar isso, peço que deixe créditos em algum comando, já que você não está pagando nada.

## Atenção
Este projeto foi criado para funcionar com o Command Handler que eu desenvolvi para meu bot [Denky](https://top.gg/bot/704517722100465746). Um exemplo de um comando do meu bot, está no arquivo `DenkyCommandExample.js`. Talvez seja necessário fazer mudanças no código caso seu Command Handler for diferente.

Se você usa algo como o [discord.js-light](https://npmjs.com/package/discord.js-light), você irá precisar ter o cache de Guilds e Roles.

## Suporte
Se você precisa de ajuda ou tiver problemas para configurar, entre em contato pelo meu Discord! Mande um pedido de amizade para `Veric#0311`[704468807229505637]

## FAQ
O que é o `Msg.q = async function (content) [etc]`?
 - É um sistema não-oficial para responder a mensagens com o sistema de Inline Replies. (https://www.xda-developers.com/files/2020/11/Discord-inline-replies-UI-featured-1-810x298_c.jpg). Se você usa um sistema assim, porém o metódo para responder mensagens é diferente (como message.inlineReply ou message.quote), basta alterar todas as referencias a `Msg.q` no código.

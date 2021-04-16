/* eslint-disable no-unreachable */
module.exports = (client) => {
	const Discord = require('discord.js');
	const APIMessage = Discord.APIMessage;

	client.ws.on('INTERACTION_CREATE', async (interaction) => {
		if(!interaction.member) {
			client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4,
					data: {
						content:
							':x: **|** O Denky ainda não suporta comandos na DM. Utilize comandos apenas em servidores :blush:',
					},
				},
			});
		}
		if (!client.guilds.cache.get(interaction.guild_id)) {
			client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4,
					data: {
						content:
							':x: **|** O Denky não foi adicionado corretamente neste servidor. Não será possível executar Slash Commands neste servidor enquanto o bot não for adicionado (por questões de compatibilidade).\n**Link para adicionar:** https://discord.com/oauth2/authorize?client_id=704517722100465746&scope=applications.commands&permissions=1346759886',
					},
				},
			});
			return;
		}
		const comando =
			client.commands.get(interaction.data.name) ||
			client.commands.find((cmd) =>
				cmd.aliases.includes(interaction.data.name),
			);

		if (!comando) return;

		// Denky está pensando e informar que recebemos (ACK) o INTERACTION_CREATE
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 5,
			},
		});
		// Util no Message.quote
		let respondidoJa = false;

		// Pré define algumas propriedades importantes.
		interaction.mentions = [];
		interaction.mention_everyone = false;

		// Lista de cargos mencionados
		interaction.mention_roles = new Discord.Collection();

		// DEBUG
		// console.log(require("util").inspect(interaction, { depth: 15 }))

		// Menções de usuários [SLASHCOMMANDS OPTION]
		if (
			interaction.data &&
			interaction.data.resolved &&
			interaction.data.resolved.users
		) {
			for (const membro in interaction.data.resolved.users) {
				// Adiciona o objeto do membro no Message.mentions.members
				interaction.data.resolved.users[membro].member =
					interaction.data.resolved.members[membro];

				// Adiciona o objeto do usuário no Message.mentions.users
				interaction.mentions.push(interaction.data.resolved.users[membro]);
			}
		}

		// Menções de usuários [SLASHCOMMANDS OPTION] | OLD, agora é adicionado em ordem e corretamente onde a variavel args é definida.
		/* if (interaction.data && interaction.data.resolved && interaction.data.resolved.channels) {
            for (var canal in interaction.data.resolved.channels) {
                interaction.content += (' <#' + canal + '>')
            }
        }*/

		// Menções de cargos [SLASHCOMMANDS OPTION]
		if (
			interaction.data &&
			interaction.data.resolved &&
			interaction.data.resolved.roles
		) {
			for (const cargo in interaction.data.resolved.roles) {
				// Define o cargo na collection[id, properties]
				interaction.mention_roles.set(
					cargo,
					client.guilds
						.cache.get(interaction.guild_id)
						.roles.cache.get(interaction.data.resolved.roles[cargo]),
				);
			}
		}

		// Começa a criar os argumentos baseado em uma mensagem real
		const args = interaction.data.options
			? interaction.data.options.map((i) => {
				switch (i.type) {
				case 8:
					return `<@&${i.value}>`;
					break;
				case 6:
					return `<@!${i.value}>`;
					break;
				case 7:
					return `<#${i.value}>`;
					break;
				default:
					return i.value;
					break;
				}
			  })
			: [];

		// Conteúdo "falso" da mensagem, vai juntar os valores das opções em uma única string.
		interaction.content = (interaction.data.name + ' ' + args.join(' ')).trim();

		// Cria o autor, para a propriedade author poder ser utilizada.
		interaction.author = new Discord.User(client, interaction.member.user);

		// Canal onde a interação foi criada
		const canalInteraction = client.guilds
			.cache.get(interaction.guild_id)
			.channels.cache.get(interaction.channel_id);

		// Simula a mensagem
		const msg = new Discord.Message(client, interaction, canalInteraction);

		// Metódo para fazer o bot responder sem ter que ficar refazendo comandos ou checks adicionais. Só usar um quote OU Channel#send e pronto :D
		msg.q = async function(content, options) {
			// Em caso de multiplas respostas (tipo comandos de configuração), enviar a primeira resposta como Slash Command e as outras como mensagem tradicionais
			if (!respondidoJa) {
				// Define que já foi respondido
				respondidoJa = true;

				// Quote (Inline Replies)
				const mentionRepliedUser =
					typeof ((options || content || {}).allowedMentions || {})
						.repliedUser === 'undefined'
						? true
						: (options || content).allowedMentions.repliedUser;
				delete ((options || content || {}).allowedMentions || {}).repliedUser;

				const apiMessage =
					content instanceof APIMessage
						? content.resolveData()
						: APIMessage.create(this.channel, content, options).resolveData();
				Object.assign(apiMessage.data, {
					message_reference: {
						message_id: this.id,
					},
				});

				if (
					!apiMessage.data.allowed_mentions ||
					Object.keys(apiMessage.data.allowed_mentions).length === 0
				) {
					apiMessage.data.allowed_mentions = {
						parse: ['users', 'roles'],
					};
				}
				if (
					typeof apiMessage.data.allowed_mentions.replied_user === 'undefined'
				) {
					Object.assign(apiMessage.data.allowed_mentions, {
						replied_user: mentionRepliedUser,
					});
				}

				if (Array.isArray(apiMessage.data.content)) {
					return Promise.all(
						apiMessage
							.split()
							.map((x) => {
								x.data.allowed_mentions = apiMessage.data.allowed_mentions;
								return x;
							})
							.map(this.inlineReply.bind(this)),
					);
				}

				const { data, files } = await apiMessage.resolveFiles();
				// Responder o Slash Commands
				// eslint-disable-next-line no-return-await
				return await client.api
					.webhooks(client.user.id, interaction.token)
					.messages['@original'].patch({
						data,
						files,
					})
					.then((d) => this.client.actions.MessageCreate.handle(d).message);
			}
			else {
				// Envia uma mensagem tradicional para o canal da interaction
				// eslint-disable-next-line no-return-await
				return await canalInteraction.send(content, options);
			}
		};

		// Não é possível excluir interactions do mesmo jeito que mensagens são excluídas, então substituimos o metodo delete pela função aproprieada
		msg.delete = async function() {
			// eslint-disable-next-line no-return-await
			return await client.api
				.webhooks(client.user.id, interaction.token)
				.messages['@original'].delete();
		};

		// Debug
		// console.log('Args:', args)
		console.log(
			`[SLASH COMMANDS] ${msg.author.tag} utilizou o comando ${
				interaction.data.name
			} com os argumentos: ${args.join(' ')} no servidor ${msg.guild.name} (${
				msg.guild.id
			})`,
		);

		// Cria o membro da interação (apenas o autor foi criado)
		const membroInt = new Discord.GuildMember(
			client,
			interaction.member,
			client.guilds.cache.get(interaction.guild_id),
		);

		// Verificar se o membro possui permissões
		if (comando.perm.user.length) {
			// var _perm = new Discord.Permissions(comando.perm.user)
			if (!msg.member.permissions.has(comando.perm.user)) {
				return msg.q(
					`:x: ${membroInt} **|** Você não possui permissões necessárias para executar este comando. Você precisa das seguintes permissões: \`${comando.perm.user
						.join(
							', ',
						)}\`.\n:warning: **|** Você precisa das permissões em seu cargo, não no canal atual.`,
				);
			}
		}
		// Verificar se o bot possui perms
		if (comando.perm.bot.length) {
			if (
				!msg.guild.me.permissions.has(comando.perm.bot)
			) {
				return msg.q(
					`:x: ${
						msg.author
					}  **|** Eu não possuo permissões necessárias para executar este comando. Preciso das seguintes permissões: \`${comando.perm.bot
						.join(
							', ',
						)}\`.\n:warning: **|** Preciso das permissões em meu cargo, não no canal atual.`,
				);
			}
		}

		// Finalmente, executamos o comando!
		comando.run(client, msg, args, '/');
	});
};

class ReportCommand {
	constructor() {
		return {
			perm: {
				bot: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
				user: [],
				owner: false,
			},
			nome: 'denunciar',
			cat: 'Denúncias',
			desc: 'Denuncie um membro ao servidor.',
			aliases: ['denúnciar', 'report', 'reportar', 'denuncia', 'denúncia'],
			run: this.run,
		};
	}

	async run(client, msg, args, prefixo) {
			msg.q('hello world')
		}
	}
}

module.exports = ReportCommand;

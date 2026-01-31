const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Le bot est prêt. Connecté avec: ${client.user.tag}`);
	},
};
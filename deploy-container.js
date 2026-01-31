/*
 Script pour créer le container qui va permettre de cliquer sur le bouton 
 pour ouvrir un ticket.

*/

const channelId = '1466983622568313080'; // à remplacer si le channel change (#contactez-nous)

const { 
    Events, 
    ContainerBuilder,
    ButtonStyle, 
    MessageFlags,
    Client,
    GatewayIntentBits
} =  require('discord.js');

const { token } = require('./config.json');

const client = new Client({ intents: [ GatewayIntentBits.GuildMessages ] });

const exampleContainer = new ContainerBuilder()
	.setAccentColor(0x3c70f9)
	.addTextDisplayComponents((textDisplay) =>
		textDisplay.setContent(
			'## Vous pouvez ouvrir un ticket pour contacter les organisateurs du SLAN.',
		),
	)
	.addSeparatorComponents((separator) => separator)
	.addSectionComponents((section) =>
		section
			.addTextDisplayComponents(
				(textDisplay) =>
					textDisplay.setContent(
						'### Nous allons vous répondre dans les plus brefs délais.',
					),
			)
			.setButtonAccessory((button) =>
				button.setCustomId('boutonCreerTicket').setLabel('📩 Ouvrir un ticket').setStyle(ButtonStyle.Success),
			),
	);

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Prêt ${readyClient.user.tag}`);
    
    const channel = await client.channels.fetch(channelId); // channel ou envoyer le container avec le ticket
    
    await channel.send({
        components: [exampleContainer],
        flags: MessageFlags.IsComponentsV2,
    });
});

client.login(token);
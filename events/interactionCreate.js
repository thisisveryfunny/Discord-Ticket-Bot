const { Events, MessageFlags, ChannelType, PermissionsBitField, ContainerBuilder, ButtonStyle } = require('discord.js');
const { clientId, guildId, roleOrganisateurId, categorieTicketsId } = require('../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

        // handle si l'interaction est un bouton
        if (interaction.isButton()) {
            const categorie = interaction.guild.channels.cache.get(categorieTicketsId); // get la catégorie pour les tickets
            if (interaction.customId === 'boutonCreerTicket') { // check si le bouton est pour creer un ticket
                try {
                    const ticketExistant = await categorie.children.cache.find(
                        channel => channel.name === 'ticket-' + interaction.user.username
                    );

                    if (ticketExistant) {
                        await interaction.reply({ 
                            content: `Vous avez déjà un ticket ouvert : <#${ticketExistant.id}>`, 
                            flags: MessageFlags.Ephemeral 
                        });
                        return;
                    }
                    
                    const newChannel = await interaction.guild.channels.create({
                        name: 'ticket-' + interaction.user.username,
                        type: ChannelType.GuildText, // text channel
                        parent: categorie.id,
                        // Optional: Configure permission overwrites
                        permissionOverwrites: [
                            {
                                id: guildId, // @everyone role
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: interaction.user.id, // createur du ticket
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: roleOrganisateurId, // id du role des organisateurs
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: clientId, // id du bot
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            }
                        ],
                    });

                    const messageNouveauChannel = new ContainerBuilder()
                        .setAccentColor(0x3c70f9)
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(
                                `### Bonjour <@${interaction.user.id}> !\nUn <@&${roleOrganisateurId}> va vous répondre sous peu.`,
                            ),
                        )
                        .addSeparatorComponents((separator) => separator)
                        .addSectionComponents((section) =>
                            section
                                .addTextDisplayComponents(
                                    (textDisplay) =>
                                        textDisplay.setContent(
                                            '⚠️ **Gardez en tête que nous gardons aucune copie des tickets à la fermeture de ceux-ci.**',
                                        ),
                                )
                                .setButtonAccessory((button) =>
                                    button.setCustomId('boutonFermerTicket').setLabel('🔒 Fermer le ticket').setStyle(ButtonStyle.Danger),
                                ),
                        );

                    // reply channel created
                    await interaction.reply({ content: `Le ticket a été créé.\n\n<#${newChannel.id}>`, flags: MessageFlags.Ephemeral });
                    
                    // send le message dans le nouveau channel
                    await newChannel.send({ components: [messageNouveauChannel], flags: MessageFlags.IsComponentsV2 });
                    
                    // delete la reply du bot apres 10 secondes
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000); 
                
                }
                catch (error) {
                    console.error(error);
                }
            }
            if (interaction.customId === 'boutonFermerTicket'){
                try {
                    // interaction.channel.name.startsWith(`ticket-${interaction.user.username}`) || 
                    if (interaction.channel.name === `ticket-${interaction.user.username}` || interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                        interaction.reply('Le ticket va être fermé dans 15 secondes...\n\n');
                        setTimeout(async () => {
                            await interaction.channel.delete();
                        }, 15000);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
	},
};
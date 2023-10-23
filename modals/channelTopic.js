const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const topicInput = new TextInputBuilder()
    .setCustomId('channelTopicTopic')
    .setLabel('Please write the new channel topic below.')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(1024)
    .setRequired(true)

const topicActionRow = new ActionRowBuilder().addComponents(topicInput);

module.exports = {
    modal: (id) => new ModalBuilder()
        .setCustomId('channelTopic_' + id)
        .setTitle('New Channel Topic')
        .addComponents(topicActionRow),
    component: 'moderation',
    onSubmit(interaction) {
        return new Promise(async (resolve, reject) => {
            const id = interaction.customId.slice(13);
            const newTopic = interaction.fields.getTextInputValue('channelTopicTopic');
            const res = await interaction.guild.channels.cache.get(id).setTopic(newTopic, 'Channel topic set to "' + newTopic + '" by ' + interaction.user.username + '.').catch(e => reject(e));
            if (res) interaction.reply({ content: 'Channel updated successfully.', ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    }
};
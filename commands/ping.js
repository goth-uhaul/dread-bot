const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s ping'),
    component: 'utility',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            interaction.editReply('Ping: ' + (sent.createdTimestamp - interaction.createdTimestamp + 'ms')).then(resolve()).catch((e) => reject(e));
        });
    }
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s ping'),
    component: 'utility',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            const time = Date.now();
            await interaction.reply('Pinging...')
            interaction.editReply('Ping: ' + (interaction.createdTimestamp - time + 'ms')).then(resolve()).catch((e) => reject(e));
        });
    }
};

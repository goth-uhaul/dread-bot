const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const uptime = () => {
    const days = Math.floor(client.uptime / 86400000) * 86400000;
    const hours = Math.floor((client.uptime - days) / 3600000) * 3600000;
    const minutes = Math.floor((client.uptime - days - hours) / 60000) * 60000;
    const seconds = Math.floor((client.uptime - days - hours - minutes) / 1000) * 1000;
    const milliseconds = Math.floor(client.uptime - days - hours - minutes - seconds);

    return `${days / 86400000}d ${hours / 3600000}h ${minutes / 60000}m ${seconds / 1000}s ${milliseconds}ms`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Gets info about the bot'),
    execute(interaction) {
        return new Promise (async (resolve, reject) => {
            let embed = new EmbedBuilder()
                .setTitle('Info about me!')
                .setThumbnail(client.user.avatarURL())
                .addFields(
                    { name: 'Current memory usage', value: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB', inline: true },
                    { name: 'Creation Date', value: client.user.createdAt.toUTCString(), inline: true },
                    { name: 'Uptime', value: uptime(), inline: true }
                );
            return interaction.reply({ embeds: [embed] }).then(resolve()).catch(e => reject(e));
        });
    }
};

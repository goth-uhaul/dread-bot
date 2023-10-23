const { EmbedBuilder } = require('discord.js')

module.exports = {
    applicationEmbed: (response) => {
        return new EmbedBuilder().setTitle('Teacher Application').addFields(
            { name: 'User ID', value: response.userId, inline: true },
            { name: 'Discord Username', value: response.discordName, inline: true },
            { name: 'SRC Username', value: response.srcName, inline: true },
            { name: 'Positions', value: response.positions, inline: true },
            { name: 'Time Running', value: response.timeRunning, inline: true },
            { name: 'Ability to Stream', value: response.hardware, inline: true },
            { name: 'Strength', value: response.strength },
            { name: 'Weaknesss', value: response.weakness },
            { name: 'Backup Strats', value: response.backupStrats },
            { name: 'Other Strats', value: response.otherStrats },
            { name: 'Comments', value: response.comments }
        )
    }
}
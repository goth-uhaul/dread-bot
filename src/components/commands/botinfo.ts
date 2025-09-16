import { SlashCommandBuilder, EmbedBuilder, Client } from "discord.js";

import { Command } from "../../lib/command";


const uptime = (client: Client) => {
    if (!client.uptime) throw Error("No client uptime; not logged in.")
    const days = Math.floor(client.uptime / 86400000) * 86400000;
    const hours = Math.floor((client.uptime - days) / 3600000) * 3600000;
    const minutes = Math.floor((client.uptime - days - hours) / 60000) * 60000;
    const seconds = Math.floor((client.uptime - days - hours - minutes) / 1000) * 1000;
    const milliseconds = Math.floor(client.uptime - days - hours - minutes - seconds);

    return `${days / 86400000}d ${hours / 3600000}h ${minutes / 60000}m ${seconds / 1000}s ${milliseconds}ms`;
};

export default new Command({
    name: "botinfo",
    builder: new SlashCommandBuilder().setDescription("Gets info about the bot"),
    execute: async (interaction) => {
        const embed = new EmbedBuilder()
            .setTitle(interaction.client.user.displayName)
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
                { name: "Current memory usage", value: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + " MB", inline: true },
                { name: "Creation Date", value: interaction.client.user.createdAt.toUTCString(), inline: true },
                { name: "Uptime", value: uptime(interaction.client), inline: true },
            );
        interaction.reply({ embeds: [embed] });
    }
});

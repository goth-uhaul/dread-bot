import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

import { Command, Subcommand } from "../../lib/command";


export default new Command({
    name: "ping",
    builder: new SlashCommandBuilder().setDescription("Checks the bot's ping"),
    subcommands: [
        new Subcommand({
            name: "heartbeat",
            builder: new SlashCommandSubcommandBuilder().setDescription("Checks the bot's websocket heartbeat"),
            execute: async (interaction) => {
                await interaction.reply(`Ping: ${interaction.client.ws.ping}ms`);
            },
        }),
        new Subcommand({
            name: "roundtrip",
            builder: new SlashCommandSubcommandBuilder().setDescription("Checks the bot's roundtrip latency"),
            execute: async (interaction) => {
                const sent = await interaction.reply({ content: "Pinging...", withResponse: true });
                const responseTime = sent.resource?.message?.createdTimestamp;
                if (responseTime) interaction.editReply(`Ping: ${responseTime - interaction.createdTimestamp}ms`);
                else interaction.editReply("There was an error while processing that interaction.");
            },
        }),
    ],
});

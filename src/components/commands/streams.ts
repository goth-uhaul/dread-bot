import { MessageFlags, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

import { StreamBlacklistTable } from "../../databases/db_objects";
import { Command, Subcommand } from "../../lib/command";


export default new Command({
    name: "streams",
    builder: new SlashCommandBuilder().setDescription("Commands related to stream notifications"),
    subcommands: [
        new Subcommand({
            name: "toggle",
            builder: new SlashCommandSubcommandBuilder().setDescription("Opt-out/in from having your streams posted"),
            execute: async (interaction) => {
                const user = await StreamBlacklistTable.findOne({ where: { userId: interaction.user.id } });

                if (user) await user.destroy();
                else await StreamBlacklistTable.create({ userId: interaction.user.id });

                interaction.reply({ content: "Your streams will " + (user ? "now" : "no longer") + " be posted.", flags: MessageFlags.Ephemeral });
            }
        }),
        new Subcommand({
            name: "status",
            builder: new SlashCommandSubcommandBuilder().setDescription("Check the status of your stream notifications"),
            execute: async (interaction) => {
                const user = await StreamBlacklistTable.findOne({ where: { userId: interaction.user.id } });

                interaction.reply({ content: "Your streams are currently " + (user ? "not " : "") + "being posted.", flags: MessageFlags.Ephemeral });
            }
        }),
    ],
});

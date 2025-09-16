import { exec } from "child_process";
import { promisify } from "util";

import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { Command } from "../../lib/command";


const execAsync = promisify(exec);

export default new Command({
    name: "update",
    builder: new SlashCommandBuilder().setDescription("Update bot/reload commands"),
    ownerOnly: true,
    execute: async (interaction) => {
        const { stderr } = await execAsync("git fetch --all && git reset --hard origin/main");
        if (stderr) {
            interaction.reply(stderr);
        }
        else {
            interaction.reply({ content: "Rebooting...", flags: MessageFlags.Ephemeral }).then(() => process.exit(0));
        }
    }
});

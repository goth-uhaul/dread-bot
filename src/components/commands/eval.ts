import { inspect } from "util";

import { SlashCommandBuilder } from "discord.js";

import { Command } from "../../lib/command";


const clean = text => {
    if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
};

export default new Command({
    name: "eval",
    builder: new SlashCommandBuilder()
        .addStringOption(option => option
            .setName("code")
            .setDescription("Code to eval")
            .setRequired(true))
		.addBooleanOption(option => option
			.setName("no-return")
            .setDescription("Don't return value"))
		.setDescription("eval") as SlashCommandBuilder,
    ownerOnly: true,
    execute: async (interaction) => {
        const shouldReturn = !!interaction.options.getBoolean("return");

        try {
            let evaled = await new Promise(resolve => resolve(eval(interaction.options.getString("code", true))));
            if (shouldReturn) return;

            if (typeof evaled !== "string") evaled = inspect(evaled);

            interaction.reply("```js\n" + evaled + "```");
        }
        catch (err) {
            interaction.reply("`ERROR` ```xl\n" + clean(err) + "\n```");
        }
    }
});

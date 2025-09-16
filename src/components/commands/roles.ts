import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, MessageFlags, InteractionContextType } from "discord.js";

import { Command } from "../../lib/command";
import { SelectMenuBuilder } from "../../lib/select_menu";


export default new Command({
    name: "roles",
    builder: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName("user")
            .setDescription("The user to update the roles of"))
        .setDescription("Sets a user's roles") as SlashCommandBuilder,
    moderatorOnly: true,
    execute: async (interaction) => {
        const user = interaction.options.getUser("user") || interaction.user;
        const addRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("addUserRolesSelection", user.id));
        const removeRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("removeUserRolesSelection", user.id));

        await interaction.reply({ content: "Select " + user.toString() + "'s roles." , components: [addRoleSelection, removeRoleSelection], flags: MessageFlags.Ephemeral });
    },
});

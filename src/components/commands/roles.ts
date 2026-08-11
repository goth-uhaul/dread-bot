import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, MessageFlags, InteractionContextType, SlashCommandSubcommandBuilder } from "discord.js";

import { Command, Subcommand } from "../../lib/command";
import { SelectMenuBuilder } from "../../lib/select_menu";


export default new Command({
    name: "role",
    builder: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setContexts(InteractionContextType.Guild)
        .setDescription("Role related commands"),
    moderatorOnly: true,
    subcommands: [
        new Subcommand({
            name: "user",
            builder: new SlashCommandSubcommandBuilder()
                .setDescription("Sets a user's roles")
                .addUserOption(option => option
                    .setName("user")
                    .setDescription("The user to update the roles of")),
            moderatorOnly: true,
            execute: async (interaction) => {
                const user = interaction.options.getUser("user") || interaction.user;
                const addRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("addUserRolesSelection", user.id));
                const removeRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("removeUserRolesSelection", user.id));

                await interaction.reply({ content: `Select ${user}'s roles.` , components: [addRoleSelection, removeRoleSelection], flags: MessageFlags.Ephemeral });
            },
        }),
        new Subcommand({
            name: "clear",
            builder: new SlashCommandSubcommandBuilder()
                .setDescription("Remove a role from all users")
                .addRoleOption(option => option
                    .setName("role")
                    .setDescription("The role to clear")
                    .setRequired(true)),
            moderatorOnly: true,
            execute: async (interaction) => {
                const roleId = interaction.options.getRole("role", true).id;
                const role = await interaction.guild?.roles.fetch(roleId);
                if (!role) throw Error("Could not fetch role");

                const membersWithRole = role.members.size;
                for (const [, member] of role.members) await member.roles.remove(roleId, `Role cleared by ${interaction.user.username}`);
                await interaction.reply(`Cleared ${role} from ${membersWithRole} users.`);
            },
        }),
    ],
});

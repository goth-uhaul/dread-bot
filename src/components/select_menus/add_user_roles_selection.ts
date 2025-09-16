import { MessageFlags, RoleSelectMenuBuilder } from "discord.js";

import { SelectMenu } from "../../lib/select_menu";
import { formatRoles } from "../../lib/utils";


export default new SelectMenu({
    name: "addUserRolesSelection",
    builder: (id) => new RoleSelectMenuBuilder()
        .setCustomId("addUserRolesSelection_" + id)
        .setPlaceholder("Roles to add")
        .setMinValues(0)
        .setMaxValues(10),
    execute: async (interaction) => {
        if (!interaction.isRoleSelectMenu() || !interaction.inCachedGuild() || !interaction.guild.members.me) return;

        const highestRole = interaction.guild.members.me.roles.highest;
        const higherRole = interaction.roles.find(r => r.position >= highestRole.position);
        if (higherRole) {
            interaction.reply({ content: `The ${higherRole.toString()} role is not lower than my highest role. Please de-select it.`, flags: MessageFlags.Ephemeral });
            return;
        }

        const member = await interaction.guild.members.fetch(interaction.customId.slice(22));
        const oldRoles = member.roles.cache;

        if (!interaction.roles.find(r => r.id !== interaction.guild.roles.everyone.id && !oldRoles.has(r.id))) {
            interaction.reply({ content: "No changes made, as no new roles were selected.", flags: MessageFlags.Ephemeral });
            return;
        }

        const newMember = await member.roles.add(
            interaction.roles,
            `${formatRoles(interaction.roles.filter(r => !oldRoles.has(r.id)).map(r => r.name))} added by ${interaction.user.username}.`,
        );
        if (newMember) interaction.reply({
            content: `${member.user.toString()}'s roles updated successfully.\n\nRoles added: ${newMember.roles.cache.difference(oldRoles).map(r => r.toString())}`,
            flags: MessageFlags.Ephemeral,
        });
    }
});

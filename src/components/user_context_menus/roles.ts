import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, ActionRowBuilder, MessageFlags, InteractionContextType } from "discord.js";

import { UserContextMenu } from "../../lib/context_menu";
import { SelectMenuBuilder } from "../../lib/select_menu";


export default new UserContextMenu({
    name: "Add/Remove Roles",
    builder: new ContextMenuCommandBuilder()
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setContexts(InteractionContextType.Guild),
    moderatorOnly: true,
    execute: async (interaction) => {
        const addRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("addUserRolesSelection", interaction.targetUser.id));
        const removeRoleSelection = new ActionRowBuilder<SelectMenuBuilder>().addComponents(interaction.client.createSelectMenu("removeUserRolesSelection", interaction.targetUser.id));

        await interaction.reply({ content: `Select ${interaction.targetUser.toString()}'s roles.` , components: [addRoleSelection, removeRoleSelection], flags: MessageFlags.Ephemeral });
    },
});

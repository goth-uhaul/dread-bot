const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const { moderatorRole } = require('../config.json');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Add/Remove Roles')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setDMPermission(false),
    component: 'moderation',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            if (!interaction.member.roles.cache.has(moderatorRole)) return interaction.reply({ content: 'You don\'t have permission to execute this command!', ephemeral: true }).then(resolve()).catch(e => reject(e));

            const addRoleSelection = new ActionRowBuilder().addComponents(client.selectMenus.get('addUserRolesSelection').selectMenu(interaction.targetUser.id));
            const removeRoleSelection = new ActionRowBuilder().addComponents(client.selectMenus.get('removeUserRolesSelection').selectMenu(interaction.targetUser.id));

			await interaction.reply({ content: 'Select ' + interaction.targetUser.toString() + '\'s roles.' , components: [addRoleSelection, removeRoleSelection], ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    },
};
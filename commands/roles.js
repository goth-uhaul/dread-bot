const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const { moderatorRole } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Sets a user\'s roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to update the roles of.')
            .setRequired(true)),
    component: 'moderation',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            if (!interaction.member.roles.cache.has(moderatorRole)) return interaction.reply({ content: 'You don\'t have permission to execute this command!', ephemeral: true }).then(resolve()).catch(reject);

            const user = interaction.options.getUser('user');

            const addRoleSelection = new ActionRowBuilder().addComponents(client.selectMenus.get('addUserRolesSelection').selectMenu(user.id));
            const removeRoleSelection = new ActionRowBuilder().addComponents(client.selectMenus.get('removeUserRolesSelection').selectMenu(user.id));

			await interaction.reply({ content: 'Select ' + user.toString() + '\'s roles.' , components: [addRoleSelection, removeRoleSelection], ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    },
    autocomplete(interaction) {
        return new Promise((resolve, reject) => {});
    }
};
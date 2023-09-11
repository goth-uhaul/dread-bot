const { RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    selectMenu: (id) => new RoleSelectMenuBuilder()
        .setCustomId('addUserRolesSelection_' + id)
        .setPlaceholder('Roles to add')
        .setMinValues(0)
        .setMaxValues(10),
    component: 'moderation',
    onSelection: (interaction) => {
        return new Promise(async (resolve, reject) => {
            const member = await interaction.guild.members.fetch(interaction.customId.slice(22)).catch(e => reject(e));
            const oldRoles = member.roles.cache;

            console.log(oldRoles.map(r => r.name), interaction.roles.map(r => r.name), oldRoles.intersect(interaction.roles).map(r => r.name));
            if (oldRoles.intersect(interaction.roles).size === interaction.roles.size) return interaction.reply({ content: 'No changes made, as no new roles were selected.', ephemeral: true }).then(resolve()).catch(e => reject(e));

            const newMember = await member.roles.add(interaction.roles).catch(e => reject(e));
            interaction.reply({ content: member.user.toString() + '\'s roles updated successfully.\n\nRoles added: ' + newMember.roles.cache.difference(oldRoles).map(r => r.toString()), ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    }
};

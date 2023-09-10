const { RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    selectMenu: (id) => new RoleSelectMenuBuilder()
        .setCustomId('removeUserRolesSelection_' + id)
        .setPlaceholder('Roles to remove')
        .setMinValues(0)
        .setMaxValues(10),
    component: 'moderation',
    onSelection: (interaction) => {
        return new Promise(async (resolve, reject) => {
            const member = await interaction.guild.members.fetch(interaction.customId.slice(25));
            const oldRoles = member.roles.cache;

            console.log(oldRoles.map(r => r.name), interaction.roles.map(r => r.name), oldRoles.difference(interaction.roles).map(r => r.name));
            if (oldRoles.difference(interaction.roles).size === interaction.roles.size) return interaction.reply({ content: 'No changes made, as no existing roles were selected.', ephemeral: true }).then(resolve()).catch(e => reject(e));

            const newMember = await member.roles.remove(interaction.roles);
            interaction.reply({ content: member.user.toString() + '\'s roles updated successfully.\n\nRoles removed: ' + newMember.roles.cache.difference(oldRoles).map(r => r.toString()), ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    }
};

const { RoleSelectMenuBuilder } = require('discord.js');

const formatRoles = (roles) => {
    if (roles.length === 1) return '@' + roles[0];
    else if (roles.length === 2) return '@' + roles[0] + ' and @' + roles[1];
    else if (roles.length > 2) {
        const lastElement = roles.pop();
        return roles.map(r => '@' + r + ', ').join() + '@' + lastElement;
    }
};

module.exports = {
    selectMenu: (id) => new RoleSelectMenuBuilder()
        .setCustomId('addUserRolesSelection_' + id)
        .setPlaceholder('Roles to add')
        .setMinValues(0)
        .setMaxValues(10),
    component: 'moderation',
    onSelection: (interaction) => {
        return new Promise(async (resolve, reject) => {
            const highestRole = interaction.guild.members.me.roles.highest;
            const higherRole = interaction.roles.find(r => r.position >= highestRole.position);
            if (higherRole) return interaction.reply({ content: 'The ' + higherRole.toString() + ' role is not lower than my highest role. Please de-select it.', ephemeral: true }).then(resolve()).catch(e => reject(e));

            const member = await interaction.guild.members.fetch(interaction.customId.slice(22)).catch(e => reject(e));
            const oldRoles = member.roles.cache;

            if (!interaction.roles.find(r => r.id !== interaction.guild.roles.everyone.id && !oldRoles.has(r.id))) return interaction.reply({ content: 'No changes made, as no new roles were selected.', ephemeral: true }).then(resolve()).catch(e => reject(e));

            const newMember = await member.roles.add(interaction.roles, formatRoles(interaction.roles.filter(r => !oldRoles.has(r.id)).map(r => r.name)) + ' added by ' + interaction.user.username + '.').catch(e => reject(e));
            if (newMember) interaction.reply({ content: member.user.toString() + '\'s roles updated successfully.\n\nRoles added: ' + newMember.roles.cache.difference(oldRoles).map(r => r.toString()), ephemeral: true }).then(resolve()).catch(e => reject(e));
        });
    }
};

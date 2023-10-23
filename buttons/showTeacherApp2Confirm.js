const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    button: () => new ButtonBuilder()
        .setCustomId('showTeacherApp2Confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary),
    component: 'bootcamp',
    onPressed: (interaction) => new Promise(async (resolve, reject) => {
        if (wipForms.find(x => x.id === interaction.user.id)) await interaction.showModal(client.modals.get('teacherApp2').modal());
        else interaction.reply({ content: 'The form has expired! Please use `/apply` and start again.', ephemeral: true });
    })
};

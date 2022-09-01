const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    button: (modal) => new ButtonBuilder()
        .setCustomId('showModalConfirm_' + modal)
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary),
    onPressed: (interaction) => {
        return new Promise(async (resolve, reject) => {
            await interaction.showModal(client.modals.get(interaction.customId.slice(17)).modal);
        });
    }
};

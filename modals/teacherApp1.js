const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");

let srcNameInput = new TextInputBuilder()
    .setCustomId('teacherAppSrcName')
    .setLabel('What is your username on speedrun.com?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

let timeRunningInput = new TextInputBuilder()
    .setCustomId('teacherAppTimeRunning')
    .setLabel('How long have you been running Metroid Dread?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

let hardwareInput = new TextInputBuilder()
    .setCustomId('teacherAppHardware')
    .setLabel('Do you have an easy way to stream to Discord?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

const srcNameActionRow = new ActionRowBuilder().addComponents(srcNameInput);
const timeRunningActionRow = new ActionRowBuilder().addComponents(timeRunningInput);
const hardwareActionRow = new ActionRowBuilder().addComponents(hardwareInput);

module.exports = {
    modal: new ModalBuilder()
        .setCustomId('teacherApp1')
        .setTitle('Application Form (Part 1)')
        .addComponents(srcNameActionRow, timeRunningActionRow, hardwareActionRow),
    onSubmit(interaction) {
        return new Promise(async (resolve, reject) => {
            if (!wipForms.find(x => x.id === interaction.user.id)) {
                console.log(addWipForm(interaction));

                const messageContent = 'Here are your responses so far:\n' +
                '\nSRC Username: ' + interaction.fields.getTextInputValue('teacherAppSrcName') +
                '\nTime Running: ' + interaction.fields.getTextInputValue('teacherAppTimeRunning') +
                '\nHardware: ' + interaction.fields.getTextInputValue('teacherAppHardware') +
                '\n\nIf you are ready to complete the second part of the form, please press the button below. This will expire in 15 minutes ()';

                const button = new ActionRowBuilder().addComponents(client.buttons.get('showModalConfirm').button('teacherApp2'));
			    await interaction.reply({ content: messageContent, components: [button] });
            }
        });
    }
};

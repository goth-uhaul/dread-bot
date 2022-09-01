const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const { applicationChannel } = require('../config.json');

let strengthInput = new TextInputBuilder()
    .setCustomId('teacherAppStrength')
    .setLabel('What\'s your biggest strength in speedrunning?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

let weaknessInput = new TextInputBuilder()
    .setCustomId('teacherAppWeakness')
    .setLabel('What\'s your biggest weakness in speedrunning?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

let backupStratsInput = new TextInputBuilder()
    .setCustomId('teacherAppBackupStrats')
    .setLabel('How many backup strats can you teach?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

let otherStratsInput = new TextInputBuilder()
    .setCustomId('teacherAppOtherStrats')
    .setLabel('Can you teach strats that you don\'t use?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

let commentsInput = new TextInputBuilder()
    .setCustomId('teacherAppComments')
    .setLabel('Please put any additional comments below.')
    .setStyle(TextInputStyle.Paragraph);

const strengthActionRow = new ActionRowBuilder().addComponents(strengthInput);
const weaknessActionRow = new ActionRowBuilder().addComponents(weaknessInput);
const backupStratsActionRow = new ActionRowBuilder().addComponents(backupStratsInput);
const otherStratsActionRow = new ActionRowBuilder().addComponents(otherStratsInput);
const commentsActionRow = new ActionRowBuilder().addComponents(commentsInput);

module.exports = {
    modal: new ModalBuilder()
        .setCustomId('teacherApp2')
        .setTitle('Application Form (Part 2)')
        .addComponents(strengthActionRow, weaknessActionRow, backupStratsActionRow, otherStratsActionRow, commentsActionRow),
    onSubmit(interaction) {
        return new Promise(async (resolve, reject) => {
            let form = wipForms.find(x => x.id === interaction.user.id);

            if (!form) {
                const messageContent = 'The form has expired! Please use `/apply` and start again. So you don\'t lose them, here were the responses you just submitted:\n' +
                '\nStrength: ' + interaction.fields.getTextInputValue('teacherAppStrength') +
                '\nWeakness: ' + interaction.fields.getTextInputValue('teacherAppWeakness') +
                '\nBackup Strats: ' + interaction.fields.getTextInputValue('teacherAppBackupStrats') +
                '\nOther Strats: ' + interaction.fields.getTextInputValue('teacherAppOtherStrats') +
                '\nComments: ' + interaction.fields.getTextInputValue('teacherAppComments');

                interaction.reply({ content: messageContent, ephemeral: true });
            }
            else {
                removeWipForm(form, form.timeout);

                let response = await (TeacherResponses.findOne({ where: { userId: interaction.user.id } }));
                let updated = false;
                
                if (response) {
                    await TeacherResponses.update({
                        srcName: form.form.fields.getTextInputValue('teacherAppSrcName'),
                        positions: '',
                        timeRunning: form.form.fields.getTextInputValue('teacherAppTimeRunning'),
                        hardware: form.form.fields.getTextInputValue('teacherAppHardware'),
                        strength: interaction.fields.getTextInputValue('teacherAppStrength'),
                        weakness: interaction.fields.getTextInputValue('teacherAppWeakness'),
                        backupStrats: interaction.fields.getTextInputValue('teacherAppBackupStrats'),
                        otherStrats: interaction.fields.getTextInputValue('teacherAppOtherStrats'),
                        comments: interaction.fields.getTextInputValue('teacherAppComments'),
                        upVotes: 0,
                        downVotes: 0,
                        status: 'Pending'
                    }, { where: { userId: interaction.user.id } });

                    updated = true;
                }
                else response = await TeacherResponses.create({
                    userId: interaction.user.id,
                    discordName: interaction.user.username,
                    srcName: form.form.fields.getTextInputValue('teacherAppSrcName'),
                    positions: '',
                    timeRunning: form.form.fields.getTextInputValue('teacherAppTimeRunning'),
                    hardware: form.form.fields.getTextInputValue('teacherAppHardware'),
                    strength: interaction.fields.getTextInputValue('teacherAppStrength'),
                    weakness: interaction.fields.getTextInputValue('teacherAppWeakness'),
                    backupStrats: interaction.fields.getTextInputValue('teacherAppBackupStrats'),
                    otherStrats: interaction.fields.getTextInputValue('teacherAppOtherStrats'),
                    comments: interaction.fields.getTextInputValue('teacherAppComments'),
                    upVotes: 0,
                    downVotes: 0,
                    status: 'Pending'
                });

                const responseText = '\nUser ID: ' + response.userId +
                '\nDiscord Username: ' + response.discordName +
                '\nSRC Username: ' + response.srcName +
                '\nPositions: ' + response.positions +
                '\nTime Running: ' + response.timeRunning +
                '\nHardware: ' + response.hardware +
                '\nStrength: ' + response.strength +
                '\nWeaknesss: ' + response.weakness +
                '\nBackup Strats: ' + response.backupStrats +
                '\nOther Strats: ' + response.otherStrats +
                '\nComments: ' + response.comments;
                
                interaction.reply('Response received! Here were your answers:\n' + responseText).then(resolve()).catch(e => reject(e));
                client.channels.fetch(applicationChannel).then(c => c.send((updated ? 'Updated Application!\n' : 'New Application!\n') + responseText));
            }
        });
    }
};

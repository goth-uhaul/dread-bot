const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const { applicationChannel, positions } = require('../config.json');
const { TeacherResponses } = require('../databases/dbObjects.js');
const { applicationEmbed } = require("../utils/applicationUtils");

let strengthInput = new TextInputBuilder()
    .setCustomId('teacherAppStrength')
    .setLabel('What\'s your biggest strength in speedrunning?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

let weaknessInput = new TextInputBuilder()
    .setCustomId('teacherAppWeakness')
    .setLabel('What\'s your biggest weakness in speedrunning?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

let backupStratsInput = new TextInputBuilder()
    .setCustomId('teacherAppBackupStrats')
    .setLabel('How many backup strats can you teach?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

let otherStratsInput = new TextInputBuilder()
    .setCustomId('teacherAppOtherStrats')
    .setLabel('Can you teach strats that you don\'t use?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

let commentsInput = new TextInputBuilder()
    .setCustomId('teacherAppComments')
    .setLabel('Please put any additional comments below.')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(1000);

const strengthActionRow = new ActionRowBuilder().addComponents(strengthInput);
const weaknessActionRow = new ActionRowBuilder().addComponents(weaknessInput);
const backupStratsActionRow = new ActionRowBuilder().addComponents(backupStratsInput);
const otherStratsActionRow = new ActionRowBuilder().addComponents(otherStratsInput);
const commentsActionRow = new ActionRowBuilder().addComponents(commentsInput);

const getPositionName = (id) => positions.find(p => p.value === id).label;

module.exports = {
    modal: () => new ModalBuilder()
        .setCustomId('teacherApp2')
        .setTitle('Application Form (Part 2)')
        .addComponents(strengthActionRow, weaknessActionRow, backupStratsActionRow, otherStratsActionRow, commentsActionRow),
    component: 'bootcamp',
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
                    response = await response.update({
                        discordName: interaction.user.tag,
                        srcName: form.questions.getTextInputValue('teacherAppSrcName'),
                        positions: form.positions.map(p => getPositionName(p)).join(', '),
                        timeRunning: form.questions.getTextInputValue('teacherAppTimeRunning'),
                        hardware: form.questions.getTextInputValue('teacherAppHardware'),
                        strength: interaction.fields.getTextInputValue('teacherAppStrength'),
                        weakness: interaction.fields.getTextInputValue('teacherAppWeakness'),
                        backupStrats: interaction.fields.getTextInputValue('teacherAppBackupStrats'),
                        otherStrats: interaction.fields.getTextInputValue('teacherAppOtherStrats'),
                        comments: interaction.fields.getTextInputValue('teacherAppComments'),
                        upvotes: '',
                        downvotes: '',
                        status: 'Pending'
                    }, { where: { userId: interaction.user.id } });

                    updated = true;
                }
                else response = await TeacherResponses.create({
                    userId: interaction.user.id,
                    discordName: interaction.user.tag,
                    srcName: form.questions.getTextInputValue('teacherAppSrcName'),
                    positions: form.positions.map(p => getPositionName(p)).join(', '),
                    timeRunning: form.questions.getTextInputValue('teacherAppTimeRunning'),
                    hardware: form.questions.getTextInputValue('teacherAppHardware'),
                    strength: interaction.fields.getTextInputValue('teacherAppStrength'),
                    weakness: interaction.fields.getTextInputValue('teacherAppWeakness'),
                    backupStrats: interaction.fields.getTextInputValue('teacherAppBackupStrats'),
                    otherStrats: interaction.fields.getTextInputValue('teacherAppOtherStrats'),
                    comments: interaction.fields.getTextInputValue('teacherAppComments'),
                    upvotes: '',
                    downvotes: '',
                    status: 'Pending'
                });

                const responseEmbed = applicationEmbed(response);

                const upvoteButton = client.buttons.get('applicationUpvote').button(response.userId);
                const downvoteButton = client.buttons.get('applicationDownvote').button(response.userId);

                const voteButtons = new ActionRowBuilder().addComponents(upvoteButton, downvoteButton);
                
                interaction.reply({ content: 'Response received!', embeds: [responseEmbed] }).then(resolve()).catch(e => reject(e));
                client.channels.fetch(applicationChannel).then(c => c.send({ content: updated ? 'Updated Application!\n' : 'New Application!\n', embeds: [responseEmbed], components: [voteButtons] }));
            }
        });
    }
};

const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { TeacherResponses } = require('../databases/dbObjects.js');

module.exports = {
    button: (id) => new ButtonBuilder()
        .setCustomId('applicationDownvote_' + id)
        .setLabel('Downvote')
        .setStyle(ButtonStyle.Primary),
    component: 'bootcamp',
    onPressed: (interaction) => new Promise(async (resolve, reject) => {
        const id = interaction.customId.slice(20);
        const userId = interaction.user.id;

        const application = await (TeacherResponses.findOne({ where: { userId: id } }));
        const upvotes = !application.upvotes ? [] : application.upvotes.split(',');
        const downvotes = !application.downvotes ? [] : application.downvotes.split(',');

        let toSend = 'You have already downvoted this application!';

        if (!downvotes.includes(userId)) {
            downvotes.push(userId);

            if (upvotes.includes(userId)) {
                upvotes.splice(upvotes.indexOf(userId), 1);
                toSend = 'Vote changed!';
            }
            else toSend = 'Vote tallied!';

            await application.update({ upvotes: upvotes.join(','), downvotes: downvotes.join(',') });
        }

        interaction.reply({ content: toSend, ephemeral: true });
    })
};

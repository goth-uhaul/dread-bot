const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { TeacherResponses } = require('../databases/dbObjects.js');

module.exports = {
    button: (id) => new ButtonBuilder()
        .setCustomId('applicationUpvote_' + id)
        .setLabel('Upvote')
        .setStyle(ButtonStyle.Primary),
    component: 'bootcamp',
    onPressed: (interaction) => {
        return new Promise(async (resolve, reject) => {
            const id = interaction.customId.slice(18);
            const userId = interaction.user.id;
            
            const application = await (TeacherResponses.findOne({ where: { userId: id } }));
            const upvotes = !application.upvotes ? [] : application.upvotes.split(',');
            const downvotes = !application.downvotes ? [] : application.downvotes.split(',');

            let toSend = 'You have already upvoted this application!';

            if (!upvotes.includes(userId)) {
                upvotes.push(userId);

                if (downvotes.includes(userId)) {
                    downvotes.splice(downvotes.indexOf(userId), 1);
                    toSend = 'Vote changed!';
                }
                else toSend = 'Vote tallied!';

                await application.update({ upvotes: upvotes.join(','), downvotes: downvotes.join(',') });
            }

            interaction.reply({ content: toSend, ephemeral: true });
        });
    }
};

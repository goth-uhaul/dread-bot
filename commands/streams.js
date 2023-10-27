const { SlashCommandBuilder, Collection, SlashCommandSubcommandBuilder } = require('discord.js');
const { StreamBlacklist } = require('../databases/dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streams')
        .setDescription('Commands related to stream notifications'),
    component: 'streams',
    subcommands: new Collection([
        ['toggle', {
            data: new SlashCommandSubcommandBuilder()
                .setName('toggle')
                .setDescription('Opt-out/in from having your streams posted'),
            component: 'streams',
            execute(interaction) {
                return new Promise(async (resolve, reject) => {
                    const user = await StreamBlacklist.findOne({ where: { userId: interaction.user.id } });

                    if (user) await user.destroy();
                    else await StreamBlacklist.create({ userId: interaction.user.id });

                    interaction.reply({ content: 'Your streams will ' + (user ? 'now' : 'no longer') + ' be posted.', ephemeral: true }).then(resolve()).catch((e) => reject(e));
                });
            }
        }],
        ['status', {
            data: new SlashCommandSubcommandBuilder()
                .setName('status')
                .setDescription('Check the status of your stream notifications'),
            component: 'streams',
            execute(interaction) {
                return new Promise(async (resolve, reject) => {
                    const user = await StreamBlacklist.findOne({ where: { userId: interaction.user.id } });

                    interaction.reply({ content: 'Your streams are currently ' + (user ? 'not ' : '') + 'being posted.', ephemeral: true }).then(resolve()).catch((e) => reject(e));
                });
            }
        }]
    ])
};

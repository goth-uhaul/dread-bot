const { SlashCommandBuilder } = require('discord.js');
const { TeacherResponses } = require('../databases/dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
		.setDescription('Fetch a bootcamp application')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User\'s ID')
                .setRequired(true)
                .setAutocomplete(true)),
    component: 'bootcamp',
	execute(interaction) {
		return new Promise(async (resolve, reject) => {
			const response = await (TeacherResponses.findOne({ where: { userId: interaction.options.getString('user') } }));
            if (!response) return interaction.reply('No application found!');

            interaction.reply('Application found!\n' +
            '\nUser ID: ' + response.userId +
            '\nDiscord Username: ' + response.discordName +
            '\nSRC Username: ' + response.srcName +
            '\nPositions: ' + response.positions +
            '\nTime Running: ' + response.timeRunning +
            '\nAbility to Stream: ' + response.hardware +
            '\nStrength: ' + response.strength +
            '\nWeaknesss: ' + response.weakness +
            '\nBackup Strats: ' + response.backupStrats +
            '\nOther Strats: ' + response.otherStrats +
            '\nComments: ' + response.comments).then(resolve()).catch(e => reject(e));
		});
	},
    autocomplete(interaction) {
        return new Promise(async (resolve, reject) => {
            const user = interaction.options.getString('user');

            let responses = await TeacherResponses.findAll();
            responses = responses.filter(r => r.userId.includes(user) || r.discordName.includes(user) || r.srcName.includes(user));

            interaction.respond(responses.map(r => { return { name: r.discordName, value: r.userId } }));
        });
    }
};

const { SlashCommandBuilder } = require('discord.js');
const { TeacherResponses } = require('../databases/dbObjects');
const { applicationEmbed } = require('../utils/applicationUtils');

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
            if (!response) return interaction.reply({ content: 'No application found!', ephemeral: true });

            interaction.reply({ content: 'Application Found!', embeds: [applicationEmbed(response)] }).then(resolve()).catch(e => reject(e));
		});
	},
    autocomplete(interaction) {
        return new Promise(async (resolve, reject) => {
            const user = interaction.options.getString('user');

            let responses = await TeacherResponses.findAll();
            responses = responses.filter(r => r.userId.includes(user) || r.discordName.includes(user) || r.srcName.includes(user));

            interaction.respond(responses.map(r => { return { name: r.discordName, value: r.userId }; })).then(resolve()).catch(e => reject(e));
        });
    }
};

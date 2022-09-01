const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
		.setDescription('Fetch a bootcamp application')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User\'s ID')
                .setRequired(true)),
	execute(interaction) {
		return new Promise(async (resolve, reject) => {
			const response = await (TeacherResponses.findOne({ where: { userId: interaction.options.getString('user') } }));

            interaction.reply(`Application found!
            User ID: ${response.userId}
            Discord Username: ${response.discordName}
            SRC Username: ${response.srcName}
            Positions: ${response.positions}
            Time Running: ${response.timeRunning}
            Hardware: ${response.hardware}
            Strength: ${response.strength}
            Weaknesss: ${response.weakness}
            Backup Strats: ${response.backupStrats}
            Other Strats: ${response.otherStrats}
            Comments: ${response.comments}`).then(resolve()).catch(e => reject(e));
		});
	}
};

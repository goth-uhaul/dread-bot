const { SlashCommandBuilder, ActionRowBuilder } = require('discord.js');

const messageContent = `This is a three part application process. After selecting the positions you would like to apply for, you will have 15 minutes to submit the following two parts of the application, or you will have to start over. You can preview the questions that you will be asked below, so that you may prepare your responses ahead of time.

Questions Part 1:
1) What is your username on speedrun.com?
2) How long have you been running Metroid Dread?
3) Do you have an easy way to stream to Discord?

Questions Part 2:
4) What's your biggest strength in speedrunning?
5) What's your biggest weakness in speedrunning?
6) How many backup strats can you teach?
7) Can you teach strats that you don't use?
8) Please put any additional comments below.

Please select the roles you would like to apply for below. Upon closing the dropdown menu, the application process will begin. If you accidentally make the incorrect selection, please press 'Cancel' on the following menu and try again. Note that if you have previously completed and submitted an application, this will update your previous one.`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
		.setDescription('Apply to be a bootcamp teacher'),
	component: 'bootcamp',
	execute(interaction) {
		return new Promise(async (resolve, reject) => {
			const selection = new ActionRowBuilder().addComponents(client.selectMenus.get('teacherRoleSelection').selectMenu());

			await interaction.reply({ content: messageContent , components: [selection] }).then(resolve()).catch(e => reject(e));
		});
	}
};

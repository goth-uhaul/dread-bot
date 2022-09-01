const { SlashCommandBuilder, ActionRowBuilder } = require('discord.js');

const messageContent = `This is a two part application process. After submitting the first half, you will have 15 minutes to submit the second half, or you will have to start over. You can preview the questions that you will be asked below.

Part 1:
1) What is your username on speedrun.com?
2) How long have you been running Metroid Dread?
3) Do you have an easy way to stream to Discord?

Part 2:
4) What's your biggest strength in speedrunning?
5) What's your biggest weakness in speedrunning?
6) How many backup strats can you teach?
7) Can you teach strats that you don't use?
8) Please put any additional comments below.

Please press the button below when you are ready to start.`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
		.setDescription('Apply to be a bootcamp teacher'),
	execute(interaction) {
		return new Promise(async (resolve, reject) => {
			const button = new ActionRowBuilder().addComponents(client.buttons.get('showModalConfirm').button('teacherApp1'));
			await interaction.reply({ content: messageContent , components: [button] });
		});
	}
};

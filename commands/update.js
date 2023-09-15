const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const execAsync = require('util').promisify(exec);

module.exports = {
	data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update bot/reload commands'),
    component: 'functionality',
	ownerOnly: true,
	execute(interaction) {
		return new Promise(async (resolve, reject) => {
			const { err, stdout } = await execAsync('git fetch --all && git reset --hard origin/main');
            if (err) {
                return interaction.reply(err.message).then(resolve()).catch((e) => reject(e));
            }
            else {
                interaction.reply({ content: 'Rebooting...', ephemeral: true }).then(() => process.exit(0)).catch((e) => reject(e));
            }
		});
	}
};

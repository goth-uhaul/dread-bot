const { SlashCommandBuilder, Collection, ActionRowBuilder } = require('discord.js');
const { srcRole } = require('../config.json');

const apiKeyWarning = `When you press the button below, you will be prompted by a window to provide your API key from SRC.
Please ensure you are logged into your SRC account, then follow [this link](<https://www.speedrun.com/settings/api>) and show/copy your key.

Note that anyone who gains access to this key will gain full access to your SRC account, so only post it in the pop-up window!

The bot will only use your key to check that your SRC account exists; your key is never saved. This can be verified by checking the source code [here](<https://github.com/MayberryZoom/dread-bot/blob/main/modals/srcApiKey.js>).
If you still don't feel comfortable sharing your API key, feel free to dismiss this message.`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('src')
        .setDescription('Verify your accounts on external services'),
    component: 'src',
    subcommands: new Collection([
        ['verify', {
            data: (sc) => sc
                .setName('verify')
                .setDescription('Verify your speedrun.com account'),
            component: 'src',
            execute(interaction) {
                return new Promise(async (resolve, reject) => {
                    await interaction.guild.roles.fetch();
                    if (interaction.member.roles.cache.has(srcRole)) return interaction.reply({ content: 'You already have the SRC Verified role!', ephemeral: true }).then(resolve()).catch(e => reject(e));

                    const buttonRow = new ActionRowBuilder().addComponents(client.buttons.get('showModalConfirm').button('srcApiKey'));
                    interaction.reply({ content: apiKeyWarning, components: [buttonRow], ephemeral: true }).then(resolve()).catch(e => reject(e));
                });
            }
        }]
    ]),
};

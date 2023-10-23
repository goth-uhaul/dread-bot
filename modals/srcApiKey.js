const axios = require('axios');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { srcRole } = require('../config.json');

const apiKeyInput = new TextInputBuilder()
    .setCustomId('apiKeyInput')
    .setLabel('Please enter your speedrun.com API key.')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(1024)
    .setRequired(true)

const apiKeyInputRow = new ActionRowBuilder().addComponents(apiKeyInput);

module.exports = {
    modal: () => new ModalBuilder()
        .setCustomId('srcApiKey')
        .setTitle('API Key Entry')
        .addComponents(apiKeyInputRow),
    component: 'src',
    onSubmit(interaction) {
        return new Promise(async (resolve, reject) => {
            const apiKey = interaction.fields.getTextInputValue('apiKeyInput');

            const foundRun = await axios.get('https://www.speedrun.com/api/v1/profile', { headers: { 'X-API-Key': apiKey } })
                .then(async (res) => await axios.get(res.data.data.links.find(x => x.rel === 'personal-bests').uri).catch(e => reject(e))).catch(e => reject(e))
                .then(res => res.data.data.find(run => ['3dxkz0v1', 'nd2838rd'].includes(run.run.game) && run.run.status.status === 'verified'));

            if (foundRun) {
                const res = await interaction.member.roles.add(srcRole).catch(e => reject(e));
                if (res) interaction.reply('Account verified! You should now have the SRC Verified role.').then(resolve()).catch(e => reject(e));
            }
            else interaction.reply({ content: 'You must have a verified run of Metroid Dread to receive the SRC Verified role.', ephemeral: true }).then(resolve()).catch(e => reject(e));;
        });
    }
};
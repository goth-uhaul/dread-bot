const axios = require('axios');
const { SlashCommandBuilder, Collection, ActionRowBuilder } = require('discord.js');
const { graphQlDomain, contributorRole, srcRole } = require ('../config.json');
const { wikiToken } = require('../tokens.json');

const userQuery = (id) => '{users{singleByProviderId(providerId:"' + id + '"){id,providerId,name,providerName}}}'

const fetchUser = (id) => new Promise((resolve) => axios.get('http://' + graphQlDomain + '/graphql?query=' + userQuery(id), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).then(res => resolve(res.data.data.users.singleByProviderId)));

const apiKeyWarning = `When you press the button below, you will be prompted by a window to provide your API key from SRC.
Please ensure you are logged into your SRC account, then follow [this link](<https://www.speedrun.com/settings/api>) and show/copy your key.

Note that anyone who gains access to this key will gain full access to your SRC account, so only post it in the pop-up window!

The bot will only use your key to check that your SRC account exists; your key is never saved. This can be verified by checking the source code [here](<https://github.com/MayberryZoom/dread-bot/blob/main/modals/srcApiKey.js>).
If you still don't feel comfortable sharing your API key, feel free to dismiss this message.`

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify your accounts on external services'),
    subcommands: new Collection([
        ['wiki', {
            data: (sc) =>
                sc.setName('wiki')
                .setDescription('Verify your wiki account'),
            component: 'wiki',
            execute(interaction) {
                return new Promise(async (resolve, reject) => {
                    await interaction.guild.roles.fetch();
                    if (interaction.member.roles.cache.has(contributorRole)) return interaction.reply({ content: 'You already have the contributor role!', ephemeral: true }).then(resolve()).catch(e => reject(e));
        
                    let user = await fetchUser(interaction.user.id);
                    if (!user) return interaction.reply({ content: 'No user found!', ephemeral: true }).then(resolve()).catch(e => reject(e));
        
                    await interaction.member.roles.add(contributorRole).catch(e => reject(e));
                    interaction.reply('User found! You should now have the contributor role.').then(resolve()).catch(e => reject(e));
                });
            }
        }],
        ['src', {
            data: (sc) =>
                sc.setName('src')
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

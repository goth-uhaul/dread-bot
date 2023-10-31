const { EmbedBuilder } = require('discord.js');

module.exports = {
    streamEmbed: (activity, user) => new EmbedBuilder()
        .setAuthor({ name: user.username + ' is now live!', iconURL: user.avatarURL(), url: activity.url })
        .setTitle(activity.details)
        .setURL(activity.url)
        .setImage(activity.assets.largeImageURL())
};

require('dotenv').config();
const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
    name: Events.InviteCreate,
    /**
     * @param {Invite} invite
     * @param {Client} client
     */
    async run(invite, client) {
        const logChannelId = process.env.DISCORD_HISTORYCHANNELID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${logChannelId} not found.`);
            return;
        }

        const inviter = invite.inviter;
        const inviterTag = inviter ? inviter.tag : 'Unknown';
        const inviterMention = inviter ? `<@${inviter.id}>` : 'Unknown';
        const inviterProfileUrl = inviter ? `https://discord.com/users/${inviter.id}` : '';
ㅎ
        const channelName = invite.channel ? invite.channel.name : '알 수 없음';
        const maxUses = invite.maxUses === 0 ? '무제한' : invite.maxUses;
        const expiresIn = invite.maxAge === 0 ? '무제한' : `${invite.maxAge} 초`;

        const description = `
**유저**: ${inviterMention} (${inviterTag})
**채널**: #${channelName}
**코드**: ${invite.code}
**사용가능 횟수**: ${maxUses}
**사용 가능일**: ${expiresIn}
        `;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: inviterTag, iconURL: inviter.displayAvatarURL(), url: inviterProfileUrl })
            .setDescription(description)
            .setTimestamp(new Date());

        await logChannel.send({ embeds: [embed] });
    }
};

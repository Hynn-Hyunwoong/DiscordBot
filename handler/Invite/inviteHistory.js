const { EmbedBuilder, Events } = require('discord.js');
const { generalHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.InviteCreate,
    /**
     * @param {Invite} invite
     * @param {Client} client
     */
    async run(invite, client) {
        try {
            const logChannel = await client.channels.fetch(generalHistoryChannelId);
            
            if (!logChannel) {
                console.error(`Log channel with ID ${generalHistoryChannelId} not found.`);
                return;
            }

            const inviter = invite.inviter;
            const inviterTag = inviter ? inviter.tag : 'Unknown';
            const inviterMention = inviter ? `<@${inviter.id}>` : 'Unknown';
            const inviterProfileUrl = inviter ? `https://discord.com/users/${inviter.id}` : '';

            const maxUses = invite.maxUses === 0 ? '무제한' : invite.maxUses;
            const expiresIn = invite.maxAge === 0 ? '무제한' : `${invite.maxAge} 초`;

            const description = `
**제가 생성했어요!**: ${inviterMention} (${inviterTag})
**초대코드는 이렇게 만들어져요!**: ${invite.code}
**이 코드의 사용가능한 횟수에요**: ${maxUses}
**이 코드는 이날 만료되요!**: ${expiresIn}
            `;

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: inviterTag, iconURL: inviter.displayAvatarURL(), url: inviterProfileUrl })
                .setDescription(description)
                .setTimestamp(new Date());

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

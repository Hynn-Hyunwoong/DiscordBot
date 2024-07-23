const { Events, EmbedBuilder, GuildMember } = require('discord.js');
const { generalHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.GuildMemberRemove,
    /**
     * @param {GuildMember} member 
     */
    async run(member) {
        const logChannel = member.guild.channels.cache.get(generalHistoryChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${generalHistoryChannelId} not found.`);
            return;
        }

        try {
            const channelLink = `https://discord.com/channels/${member.guild.id}/${generalHistoryChannelId}`;
            const authorLink = `https://discord.com/users/${member.id}`;
            const editDate = new Date().toLocaleString();

            const description = `
[👋 ${member.guild.name}](${channelLink})에서 [@${member.displayName}](${authorLink})님이 퇴장했습니다. 👋 \n 👋 이제 더 이상 서버에 있지 않아요 👋

**유저**
\`\`\`@${member.displayName}(${member.user.username})\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${member.displayName}](${authorLink})**
            `;

            const embed = new EmbedBuilder()
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setDescription(description)
                .setTimestamp(new Date())
                .setColor('Red')
                .setThumbnail(member.user.displayAvatarURL());

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

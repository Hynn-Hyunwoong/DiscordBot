const { Events, EmbedBuilder, GuildMember } = require('discord.js');
const { generalHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.GuildMemberAdd,
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
[🎉 ${member.guild.name}](${channelLink})에 [@${member.displayName}](${authorLink})님이 추가되었습니다. 🎉 \n 🎉 새로온 사용자에게 권한을 부여했는지 확인해주세요! 🎉

**유저**
\`\`\`@${member.displayName}(${member.user.username})\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${member.displayName}](${authorLink})**
            `;

            const embed = new EmbedBuilder()
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setDescription(description)
                .setTimestamp(new Date())
                .setColor('Green')
                .setThumbnail(member.user.displayAvatarURL());

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

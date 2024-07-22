require('dotenv').config();
const { Events, EmbedBuilder, GuildMember } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    /**
     * @param {GuildMember} member 
     */
    async run(member) {
        const logChannelId = process.env.DISCORD_HISTORYCHANNELID;
        const logChannel = member.guild.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${logChannelId} not found.`);
            return;
        }

        try {
            const channelLink = `https://discord.com/channels/${member.guild.id}/${logChannelId}`;
            const authorLink = `https://discord.com/users/${member.id}`;
            const editDate = new Date().toLocaleString();

            const description = `
[#${logChannel.name}](${channelLink})에서 [@${member.user.username}](${authorLink})님이 퇴장했습니다.

**유저**
\`\`\`@${member.user.username}(${member.id})\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${member.user.username}](${authorLink})**
            `;

            const embed = new EmbedBuilder()
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setDescription(description)
                .setTimestamp(new Date())
                .setColor('Red');

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

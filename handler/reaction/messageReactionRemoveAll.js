const { Events, EmbedBuilder } = require('discord.js');
const { messageHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.MessageReactionRemoveAll,
    /**
     * @param {Message} message
     * @param {Client} client
     */
    async run(message, client) {
        if (!message.guild || !message.guild.channels) {
            console.error('Guild or Guild channels are not available.');
            return;
        }

        const logChannel = message.guild.channels.cache.get(messageHistoryChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${messageHistoryChannelId} not found.`);
            return;
        }

        const channelName = message.channel.name;
        const nickname = message.member ? (message.member.nickname || message.author.username) : message.author.username;
        const messageContent = message.content || '없음';
        const messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
        const editDate = new Date().toLocaleString();
        const channelLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}`;
        const authorLink = `https://discord.com/users/${message.author.id}`;

        const description = `
[#${channelName}](${channelLink})의 [@${nickname}](${authorLink})님이 보낸 메시지의 모든 반응이 삭제되었어요.
[메시지로 이동하기](${messageLink})

**메시지 내용**
\`\`\`${messageContent}\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${nickname}](${authorLink})**
        `;

        const embed = new EmbedBuilder()
            .setAuthor({ name: nickname, iconURL: message.author.displayAvatarURL() })
            .setDescription(description)
            .setTimestamp(new Date())
            .setColor('Red');
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

const { Events, EmbedBuilder } = require('discord.js');
const { messageHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.MessageDelete,
    /**
     * @param {Message} message
     * @param {Client} client
     */
    async run(message, client) {
        const logChannel = client.channels.cache.get(messageHistoryChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${messageHistoryChannelId} not found.`);
            return;
        }

        const channelName = message.channel.name;
        const nickname = message.member ? (message.member.nickname || message.author.username) : message.author.username;
        let messageContent;
        
        if (message.system) {
            messageContent = '삭제한 메시지는 시스템에서 생성한 메시지에요';
        } else if (!message.content) {
            messageContent = '삭제한 메시지는 시스템에서 생성한 메시지에요';
        } else {
            messageContent = message.content;
        }
        
        const editDate = new Date().toLocaleString();
        const channelLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}`;
        const authorLink = `https://discord.com/users/${message.author.id}`;

        const description = `
[#${channelName}](${channelLink})의 [@${nickname}](${authorLink})님이 보낸 메시지가 삭제되었어요.

**삭제된 메시지는 이랬어요!**
\`\`\`${messageContent}\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${nickname}](${authorLink})**
        `;

        const embed = new EmbedBuilder()
            .setAuthor({ name: nickname, iconURL: message.author.displayAvatarURL() })
            .setDescription(description)
            .setTimestamp(new Date())
            .setColor('Red');

        await logChannel.send({ embeds: [embed] });
    }
};

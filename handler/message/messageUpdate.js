const { Events, EmbedBuilder } = require('discord.js');
const { messageHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.MessageUpdate,
    /**
     * @param {Message} oldMessage
     * @param {Message} newMessage
     * @param {Client} client
     */
    async run(oldMessage, newMessage, client) {
        const logChannel = client.channels.cache.get(messageHistoryChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${messageHistoryChannelId} not found.`);
            return;
        }

        if (oldMessage.content === newMessage.content) return;

        const channelName = newMessage.channel.name;
        const nickname = newMessage.member.nickname || newMessage.author.username;
        const oldContent = oldMessage.content || '없음';
        const newContent = newMessage.content || '없음';
        const messageLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;
        const editDate = new Date().toLocaleString(); 
        const channelLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}`;
        const authorLink = `https://discord.com/users/${newMessage.author.id}`;

        const description = `
[#${channelName}](${channelLink})의 [@${nickname}](${authorLink})님이 보낸 메시지를 [@${nickname}](${authorLink})님이 고쳤어요!
[메시지로 이동하기](${messageLink})

**원래 메시지는 이랬어요!**
\`\`\`${oldContent}\`\`\`

**바뀐 메시지는 이렇게 바꿧어요!**
\`\`\`${newContent}\`\`\`

토핑봇 by.잘생긴블코틴 **${editDate} - [@${nickname}](${authorLink})**
        `;

        const embed = new EmbedBuilder()
            .setAuthor({ name: nickname, iconURL: newMessage.author.displayAvatarURL() })
            .setDescription(description)
            .setTimestamp(new Date())
            .setColor('Orange');

        await logChannel.send({ embeds: [embed] });
    }
};

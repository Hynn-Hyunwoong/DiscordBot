const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageReactionRemove,
    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     * @param {Client} client
     */
    async run(reaction, user, client) {
        console.log(`Reaction removed by ${user.tag} on message ${reaction.message.id}`);

        const logChannelId = process.env.DISCORD_MESSAGELOGCHANNELID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${logChannelId} not found.`);
            return;
        }

        try {
            if (reaction.partial) await reaction.fetch();
            if (user.partial) await user.fetch();
            if (reaction.message.partial) await reaction.message.fetch();
        } catch (error) {
            console.error('Error fetching partial data:', error);
            return;
        }

        const member = await reaction.message.guild.members.fetch(user.id).catch(console.error);
        const userNickname = member ? (member.nickname || user.username) : user.username;

        const channelName = reaction.message.channel.name;
        const messageAuthor = reaction.message.author || { tag: 'Unknown', displayAvatarURL: () => '', id: 'Unknown' };
        const nickname = reaction.message.member ? (reaction.message.member.nickname || messageAuthor.username || 'Unknown') : messageAuthor.username || 'Unknown';
        const messageContent = reaction.message.content || '없음';
        const messageLink = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;
        const editDate = new Date().toLocaleString();
        const channelLink = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}`;
        const authorLink = `https://discord.com/users/${messageAuthor.id}`;
        const userLink = `https://discord.com/users/${user.id}`;

        const emoji = reaction.emoji.toString();
        const description = `
[#${channelName}](${channelLink})의 [@${nickname}](${authorLink})님이 보낸 메시지에 이모지가 삭제되었어요.
삭제한 사용자: [@${userNickname}](${userLink})
[메시지로 이동하기](${messageLink})

**메시지 내용**
\`\`\`${messageContent}\`\`\`

**이모지**
${emoji}

토핑봇 by.잘생긴블코틴 **${editDate} - [@${nickname}](${authorLink})**
        `;

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setDescription(description)
            .setTimestamp(new Date())
            .setColor('Red');

        // Ensure message is sent only once
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log message:', error);
        }
    }
};

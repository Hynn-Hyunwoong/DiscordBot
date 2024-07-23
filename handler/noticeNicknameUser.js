require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

// 닉네임 캐시를 저장하기 위한 맵
const nicknameCache = new Map();

module.exports = {
    name: 'guildMemberUpdate',
    /**
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     * @param {Client} client
     */
    async run(oldMember, newMember, client) {
        const oldNickname = nicknameCache.get(oldMember.id) || oldMember.user.username;
        const newNickname = newMember.nickname || newMember.user.username;

        if (oldNickname !== newNickname) {
            const logChannelId = process.env.DISCORD_HISTORYCHANNELID;
            const logChannel = newMember.guild.channels.cache.get(logChannelId);

            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found.`);
                return;
            }

            const userProfileUrl = `https://discord.com/users/${newMember.user.id}`;
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
                .setDescription(`[@${newMember.nickname}](${userProfileUrl}) 님의 별명이 변경됐어요.`)
                .addFields(
                    { name: '이전 별명', value: oldNickname, inline: true },
                    { name: '현재 별명', value: newNickname, inline: true }
                )
                .setThumbnail(newMember.user.displayAvatarURL())
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
            nicknameCache.set(newMember.id, newNickname);
        }
    },
    initializeCache: async (client) => {
        const guildId = process.env.DISCORD_GUILDID;
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const members = await guild.members.fetch();
            members.forEach(member => {
                const nickname = member.nickname || member.user.username;
                nicknameCache.set(member.id, nickname);
            });
        }
        console.log('Nickname cache initialized.');
    }
};

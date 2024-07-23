const { EmbedBuilder } = require('discord.js');
const { voiceHistoryChannelId } = require('../../config/environment');

module.exports = async function handleJoin(newState, logChannel) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${newState.member?.displayName}`, iconURL: newState.member?.user.displayAvatarURL() })
        .setDescription(`${newState.member?.user} 님이 ${newState.channel.name} 음성채널에 참여했습니다.`)
        .setColor('Green');
    await logChannel.send({ embeds: [embed] });
};

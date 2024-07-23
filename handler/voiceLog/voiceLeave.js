const { EmbedBuilder } = require('discord.js');
const { voiceHistoryChannelId } = require('../../config/environment');

module.exports = async function handleLeave(oldState, logChannel) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${oldState.member?.displayName}`, iconURL: oldState.member?.user.displayAvatarURL() })
        .setDescription(`${oldState.member?.user} 님이 ${oldState.channel.name} 음성채널에서 나가셨습니다.`)
        .setColor('Red');
    await logChannel.send({ embeds: [embed] });
};

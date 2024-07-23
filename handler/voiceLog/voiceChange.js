const { EmbedBuilder } = require('discord.js');
const { voiceHistoryChannelId } = require('../../config/environment');

module.exports = async function handleSwitch(oldState, newState, logChannel) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${newState.member?.displayName}`, iconURL: newState.member?.user.displayAvatarURL() })
        .setDescription(`${newState.member?.user} 님이 음성채널을 변경했습니다.\n${oldState.channel.name} -> ${newState.channel.name}`)
        .setColor('Green');
    await logChannel.send({ embeds: [embed] });
};

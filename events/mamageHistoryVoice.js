require('dotenv').config()
const { Events, EmbedBuilder, VoiceState, ChannelType } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    /**
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @param {Client} client
     */
    async run(oldState, newState, client) {
        const logChannelId = process.env.DISCORD_HISTORYVOICECHANNELID;
        const specialVoiceChannelId = process.env.DISCORD_CREATEVOICECHANNELID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${logChannelId} not found.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${newState.member?.displayName}`, iconURL: newState.member?.user.displayAvatarURL() });

        // 음성채널에 새로 참여한 경우
        if (!oldState.channel && newState.channel) {
            embed
                .setDescription(`${newState.member?.user} 님이 ${newState.channel.name} 음성채널에 참여했습니다.`)
                .setColor('Green');
            await logChannel.send({ embeds: [embed] });
        }
        // 음성채널을 변경한 경우
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            embed
                .setDescription(`${newState.member?.user} 님이 음성채널을 변경했습니다.\n${oldState.channel.name} -> ${newState.channel.name}`)
                .setColor('Green');
            await logChannel.send({ embeds: [embed] });
        }
        // 음성채널에서 나간 경우
        else if (oldState.channel && !newState.channel) {
            embed
                .setDescription(`${newState.member?.user} 님이 ${oldState.channel.name} 음성채널에서 나가셨습니다.`)
                .setColor('Red');
            await logChannel.send({ embeds: [embed] });
        }

        // 특수 음성 채널에 참여한 경우 처리
        if (newState.channel && newState.channel.id === specialVoiceChannelId) {
            try {
                const newChannel = await newState.guild.channels.create({
                    name: `🔊 ${newState.member.displayName}`,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel.parent,
                });

                if (newChannel) {
                    await newChannel.permissionOverwrites.edit(newState.member.user, {
                        ManageChannels: true,
                    });
                    await newState.member.voice.setChannel(newChannel);

                    const interval = setInterval(async () => {
                        if (!newChannel) return clearInterval(interval);

                        if (newChannel.members.size === 0) {
                            try {
                                await newChannel.delete();
                                clearInterval(interval);
                            } catch (err) {
                                console.error(`Error deleting channel: ${err}`);
                            }
                        }
                    }, 5000);
                }
            } catch (err) {
                console.error(`Error creating special voice channel: ${err}`);
            }
        }
    }
};

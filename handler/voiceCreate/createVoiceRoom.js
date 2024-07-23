const { ChannelType } = require('discord.js');

module.exports = async function handleSpecialChannel(newState, specialVoiceChannelId) {
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
};

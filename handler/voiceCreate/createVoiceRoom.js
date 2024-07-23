const { ChannelType } = require('discord.js');

const voiceChannelNames = [
    "님 오늘은 강화하기 좋은날씨에요! 장기백은 어쩔수없지만..",
    "님 오늘은 숙제하는 날이에요! 힘내봐요",
    "님 레이드는 끝이 없는법이에요",
    "님 혼자만의 시간이 필요한가요?",
    "님 어서와요",
    "님 좋은날이에요",
    "님 게임하기 좋은날이에요",
    "님 오늘도 달리네요!"
];

module.exports = async function handleSpecialChannel(newState, specialVoiceChannelId) {
    try {
        const randomName = voiceChannelNames[Math.floor(Math.random() * voiceChannelNames.length)];
        const channelName = `🔊 ${newState.member.displayName}${randomName}`;

        const newChannel = await newState.guild.channels.create({
            name: channelName,
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

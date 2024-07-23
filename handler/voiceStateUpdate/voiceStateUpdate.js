const { Events, VoiceState } = require('discord.js');
const { voiceHistoryChannelId, createVoiceChannelId } = require('../../config/environment');
const handleJoin = require('../voiceLog/voiceJoin');
const handleSwitch = require('../voiceLog/voiceChange');
const handleLeave = require('../voiceLog/voiceLeave');
const handleSpecialChannel = require('../voiceCreate/createVoiceRoom');

module.exports = {
    name: Events.VoiceStateUpdate,
    /**
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @param {Client} client
     */
    async run(oldState, newState, client) {
        const logChannel = client.channels.cache.get(voiceHistoryChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${voiceHistoryChannelId} not found.`);
            return;
        }

        if (!oldState.channel && newState.channel) {
            await handleJoin(newState, logChannel);
        } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            await handleSwitch(oldState, newState, logChannel);
        } else if (oldState.channel && !newState.channel) {
            await handleLeave(oldState, logChannel);
        }

        if (newState.channel && newState.channel.id === createVoiceChannelId) {
            await handleSpecialChannel(newState, createVoiceChannelId);
        }
    }
};

module.exports = async function initializeLogChannel(client, logChannelId) {
    try {
        client.log = await client.channels.fetch(logChannelId);
        if (!client.log) {
            console.error(`Log channel with ID ${logChannelId} not found`);
        } else {
            console.log(`Log channel with ID ${logChannelId} is ready`);
        }
    } catch (error) {
        console.error(`Error fetching log channel with ID ${logChannelId}: ${error}`);
    }
};

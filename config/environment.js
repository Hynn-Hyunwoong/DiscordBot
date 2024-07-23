require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILDID,
    adminId: process.env.DISCORD_ADMINID,
    adminCategoryId: process.env.DISCORD_ADMINCATEGORY,
    mainChannelId: process.env.DISCORD_MAINCHANNELID,
    generalHistoryChannelId: process.env.DISCORD_HISTORYCHANNELID,
    voiceHistoryChannelId: process.env.DISCORD_HISTORYVOICECHANNELID, 
    messageHistoryChannelId: process.env.DISCORD_HISTORYMESSAGECHANNELID,
    youtubePc: process.env.DISCORD_YOUTUBEPC,
    youtubeMo: process.env.DISCORD_YOUTUBEMO,
    createVoiceChannelId: process.env.DISCORD_CREATEVOICECHANNELID, 
    youtubeAPIKEY: process.env.YOUTUBE_APIKEY,
    youtubeAPIKEY2: process.env.YOUTUBE_APIKEYBackup,
    lostArkPC: process.env.LOSTARK_PC,
    lostArkMo: process.env.LOSTARK_MO,
};

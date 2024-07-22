require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const moment = require('moment-timezone');

const youtubeAPIKeys = [
    process.env.YOUTUBE_APIKEY,
    process.env.YOUTUBE_APIKEYBackup,
];

let currentKeyIndex = 0;

function getApiKey() {
    const key = youtubeAPIKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % youtubeAPIKeys.length;
    return key;
}

const pcDiscordChannelId = process.env.DISCORD_YOUTUBEPC;
const mobileDiscordChannelId = process.env.DISCORD_YOUTUBEMO;

const pcYoutubeChannel = {
    id: process.env.LOSTARK_PC,
    lastVideoId: '',
    link: 'https://www.youtube.com/@LOSTARK_KR'
};

const moYoutubeChannel = {
    id: process.env.LOSTARK_MO,
    lastVideoId: '',
    link: 'https://www.youtube.com/@LOSTARK_MO'
};

async function checkNewVideos(client, channelInfo, isPcChannel) {
    try {
        const apiKey = getApiKey();
        const now = moment().tz('Asia/Seoul');
        const yesterday = now.clone().subtract(24, 'hours');

        console.log(`Checking videos for channel: ${channelInfo.id} between ${yesterday.format()} and ${now.format()}`);
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                key: apiKey,
                channelId: channelInfo.id,
                part: 'snippet,id',
                order: 'date',
                publishedAfter: yesterday.toISOString(),
                maxResults: 5
            }
        });

        const videos = response.data.items;
        const newVideos = videos.filter(video => video.id.videoId !== channelInfo.lastVideoId);

        if (newVideos.length > 0) {
            channelInfo.lastVideoId = newVideos[0].id.videoId;
            for (const video of newVideos) {
                sendNotifications(client, video, channelInfo.link, isPcChannel);
            }
        } else if (videos.length > 0) {
            const latestVideo = videos[0];
            console.log(`No new videos found. Last video updated:\n` +
                `Title: ${latestVideo.snippet.title}\n` +
                `Published At: ${moment(latestVideo.snippet.publishedAt).tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss (KST)')}\n` +
                `Description: ${latestVideo.snippet.description.split('\n')[0]}\n` +
                `Link: https://www.youtube.com/watch?v=${latestVideo.id.videoId}`);
        } else {
            console.log('No videos found in the last 24 hours.');
        }
    } catch (error) {
        console.error(`Error fetching videos for channel ${channelInfo.id}: `, error.response ? error.response.data : error.message);
    }
}

async function sendNotifications(client, video, link, isPcChannel) {
    const channel = isPcChannel ? await client.channels.fetch(pcDiscordChannelId) : await client.channels.fetch(mobileDiscordChannelId);

    if (channel) {
        const uploadDate = moment(video.snippet.publishedAt).tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss (KST)');
        const description = video.snippet.description.split('\n')[0];
        const message = `📺 로스트아크 공식 유투브에 새로운 영상이 올라왔어요!\n` +
            `📽️ 제목: ${video.snippet.title}\n` +
            `🎞️ 업로드 일시: ${uploadDate}\n` +
            `📨 설명: ${description}\n` +
            `✅ 링크: https://www.youtube.com/watch?v=${video.id.videoId}`;

        channel.send(message);
    }
}

module.exports = {
    name: 'ready',
    run(client) {
        console.log('YouTube notifier is ready');

        // 매일 KST 17:00에 실행
        cron.schedule('00 18 * * *', () => {
            checkNewVideos(client, pcYoutubeChannel, true);
            checkNewVideos(client, moYoutubeChannel, false);
        }, {
            timezone: 'Asia/Seoul'
        });
    }
};

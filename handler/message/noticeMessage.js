const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { guildId, noticeChannelId, lostArkAPIKEY } = require('../../config/environment');

async function getCurrentEvents() {
    try {
        console.log('Fetching events from Lost Ark API...');
        const response = await axios.get('https://developer-lostark.game.onstove.com/news/events', {
            headers: { Authorization: `Bearer ${lostArkAPIKEY}` }
        });

        const events = response.data.map(event => {
            const endDate = new Date(event.EndDate);
            const remainingDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
            const eventString = `[${event.Title}](${event.Link}) - 기간: ${new Date(event.StartDate).toLocaleDateString()} ~ ${new Date(event.EndDate).toLocaleDateString()}`;

            return {
                eventString,
                isEndingSoon: remainingDays <= 3,
                hasEnded: endDate < new Date()
            };
        });

        return events.filter(event => !event.hasEnded);
    } catch (error) {
        console.error('Error fetching events:', error);
        return [{ eventString: '이벤트 정보를 가져오는 데 실패했습니다.', isEndingSoon: false }];
    }
}

async function sendDailyNotification(client) {
    console.log('sendDailyNotification event triggered');

    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.error(`Guild with ID ${guildId} not found`);
            return;
        }

        await guild.members.fetch();
        const channel = guild.channels.cache.get(noticeChannelId);
        if (!channel) {
            console.error(`Channel with ID ${noticeChannelId} not found`);
            return;
        }

        console.log('Fetching current events...');
        const eventList = await getCurrentEvents();

        const endingSoonEvents = eventList.filter(event => event.isEndingSoon).map(event => event.eventString);
        const ongoingEvents = eventList.filter(event => !event.isEndingSoon).map(event => event.eventString);

        const embed = new EmbedBuilder()
            .setAuthor({ name: '토핑' })
            .setTitle('🔔 로아 알림 <:1_:1189100154532409405>')
            .setColor('Green')
            .setTimestamp(new Date())
            .setFooter({ text: '토핑봇 by. 🔔 주간체크리스트 도우미 🎅' })
            .addFields(
                { name: '<:star_3:1216740965323378719> 길드 ', value: '1️⃣ 길드 출석 체크(실링기부➕연구지원)\n2️⃣ 길드 혈석상점 교환', inline: false },
                { name: '<:star_2:1216742007188492288>  주간 체크 리스트', value: '1️⃣ 싱글모드 교환\n2️⃣ 주간 승리의 빛(카양겔) 보석 교환\n3️⃣ 베히모스 주간 4티어 재료교환', inline: false }
            );

        if (endingSoonEvents.length) {
            embed.addFields({ name: '<:star_8:1216741485911998545> 얼마 남지 않았어요', value: endingSoonEvents.join('\n').slice(0, 1024), inline: false });
        }

        // if (ongoingEvents.length) {
        //     embed.addFields({ name: '<:star_7:1196432261248188486>현재 진행중인 이벤트', value: ongoingEvents.join('\n').slice(0, 1024), inline: false });
        // }

        console.log('Sending embed message to channel...');
        channel.send({ embeds: [embed] })
            .then(() => console.log('Notification message sent successfully'))
            .catch(error => console.error('Error sending notification message:', error));
    } catch (error) {
        console.error('Error occurred in sendDailyNotification event:', error);
    }
}

module.exports = {
    name: 'ready',
    async run(client) {
        await sendDailyNotification(client);

        cron.schedule('0 18 * * *', () => {
            console.log('Running scheduled task for sendDailyNotification');
            sendDailyNotification(client).catch(console.error);
        });
    }
};

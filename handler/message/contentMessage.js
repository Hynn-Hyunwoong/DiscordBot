const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { guildId, calendarChannelId, lostArkAPIKEY } = require('../../config/environment');

const APIURL = 'https://developer-lostark.game.onstove.com/';

async function getGameContents() {
    try {
        console.log('Fetching contents from Lost Ark API');

        const headers = {
            Authorization: `Bearer ${lostArkAPIKEY}`,
        };

        const responseC = await axios.get(`${APIURL}gamecontents/calendar`, { headers });
        const contents = responseC.data;

        const today = new Date();
        const todayFormatted = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

        let fieldBoss = false;
        let chaosGate = false;
        let adventureIslands = [];
        let rewards = {
            '골드': new Set(),
            '카드 팩': new Set(),
            '대양의 주화': new Set(),
            '크림스네일의 동전': new Set()
        };

        contents.forEach(content => {
            const { CategoryName, ContentsName, StartTimes, RewardItems } = content;

            // 필드보스와 카오스게이트 체크
            if (CategoryName.includes('필드보스') && StartTimes.some(time => new Date(time).toLocaleDateString() === today.toLocaleDateString())) {
                fieldBoss = true;
            }

            if (CategoryName.includes('카오스게이트') && StartTimes.some(time => new Date(time).toLocaleDateString() === today.toLocaleDateString())) {
                chaosGate = true;
            }

            // 모험 섬 체크
            if (CategoryName.includes('모험 섬')) {
                const todayStartTimes = StartTimes.filter(time => {
                    const date = new Date(time);
                    return date.toLocaleDateString() === today.toLocaleDateString();
                }).map(time => new Date(time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));

                if (todayStartTimes.length > 0) {
                    adventureIslands.push({
                        name: ContentsName,
                        times: todayStartTimes
                    });

                    if (Array.isArray(RewardItems)) {
                        RewardItems.forEach(reward => {
                            if (reward && Array.isArray(reward.Items)) {
                                reward.Items.forEach(item => {
                                    // 아이템의 StartTimes 체크
                                    if (!item.StartTimes || item.StartTimes.some(time => new Date(time).toLocaleDateString() === today.toLocaleDateString())) {
                                        for (let key in rewards) {
                                            if (item.Name.includes(key)) {
                                                rewards[key].add(ContentsName);
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        console.log(`RewardItems is not an array or is missing for ${ContentsName}`);
                    }
                }
            }
        });

        let description = `오늘의 날짜 : ${todayFormatted}\n\n`;

        if (fieldBoss && chaosGate) {
            description += "**오늘의 주요컨텐츠는 필드보스와 카오스게이트에요!**\n";
            description += "매 시 정각마다 열리는 카오스게이트를 참여하고 4티어 재료와 각인서를 먹어봅시다!\n";
            description += "필드보스를 수행하고 보상을 획득해보세요!\n\n";
        } else if (fieldBoss) {
            description += "**오늘의 주요컨텐츠는 필드보스에요!**\n";
            description += "필드보스를 수행하고 보상을 획득해보세요!\n\n";
        } else if (chaosGate) {
            description += "오늘의 주요컨텐츠는 카오스게이트에요!\n";
            description += "매 시 정각마다 열리는 카오스게이트를 참여하고 4티어 재료와 각인서를 먹어봅시다!\n\n";
        } else {
            description += "오늘은 쉬는날이에요!\n\n";
        }

        if (adventureIslands.length > 0) {
            description += "**오늘의 모험섬 일정이에요**\n";
            description += `**모험섬 명 : ${adventureIslands.map(island => island.name).join(', ')}**\n`;
            description += `수행시간 : ${adventureIslands[0].times.join(', ')}\n\n`;

            description += "**오늘 모험섬의 주요 보상은 아래와 같아요!**\n";
            for (let key in rewards) {
                const rewardList = Array.from(rewards[key]);
                if (rewardList.length > 0) {
                    description += `${key} - ${rewardList.join(', ')}\n`;
                } else {
                    description += `${key} - 오늘은 없어요\n`;
                }
            }
        }

        console.log(description);

        return description;

    } catch (error) {
        console.error('Error fetching content:', error);
        return '컨텐츠 정보를 시스템 오류로 가져오지 못했어요.';
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
        const channel = guild.channels.cache.get(calendarChannelId);
        if (!channel) {
            console.error(`Channel with ID ${calendarChannelId} not found`);
            return;
        }

        console.log('Fetching game contents...');
        const description = await getGameContents();

        const embed = new EmbedBuilder()
            .setTitle('오늘의 주요 컨텐츠')
            .setDescription(description)
            .setColor('Green')
            .setTimestamp(new Date())
            .setFooter({ text: 'Lost Ark Contents' });

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

        cron.schedule('30 6 * * *', () => {
            console.log('Running scheduled task for sendDailyNotification');
            sendDailyNotification(client).catch(console.error);
        });
    }
};

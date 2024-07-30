const cron = require('node-cron');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { guildId, calendarChannelId, lostArkAPIKEY } = require('../../config/environment');

const APIURL = 'https://developer-lostark.game.onstove.com/';
const ICONS = {
    '골드': '<:gold:1267734178103824455>',
    '카드 팩': '<:card:1267734184026308628>',
    '대양의 주화': '<:medalA:1267734180381327461>',
    '크림스네일의 동전': '<:medalG:1267734191345373258>',
    '실링': '<:silver:1267734182214242364>',
    '필드보스': '<:boss:1267734189210341447>',
    '카오스게이트': '<:gate:1267734186559537173>'
};

async function getGameContents() {
    try {
        console.log('Fetching contents from Lost Ark API');

        const headers = {
            Authorization: `Bearer ${lostArkAPIKEY}`,
        };

        const responseC = await axios.get(`${APIURL}gamecontents/calendar`, { headers });
        const contents = responseC.data;
        // const testDate = new Date('2024-07-28T06:00:00')
        const today = new Date();
        today.setHours(6, 0, 0, 0); 
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(5, 0, 0, 0); 

        let fieldBoss = '';
        let chaosGate = '';
        let adventureIslands = [];
        let rewards = {
            '골드': { islands: [], icon: '' },
            '카드 팩': { islands: [], icon: '' },
            '대양의 주화': { islands: [], icon: '' },
            '크림스네일의 동전': { islands: [], icon: '' },
            '실링': { islands: [], icon: ICONS['실링'] }
        };

        contents.forEach(content => {
            const { CategoryName, ContentsName, ContentsIcon, StartTimes, RewardItems } = content;

            const isWithinTimeRange = (time) => {
                const date = new Date(time);
                return date >= today && date < tomorrow;
            };

            if (CategoryName.includes('필드보스') && StartTimes.some(isWithinTimeRange)) {
                fieldBoss = { icon: ICONS['필드보스'], name: CategoryName };
            }

            if (CategoryName.includes('카오스게이트') && StartTimes.some(isWithinTimeRange)) {
                chaosGate = { icon: ICONS['카오스게이트'], name: CategoryName };
            }

            if (CategoryName.includes('모험 섬')) {
                const todayStartTimes = StartTimes.filter(isWithinTimeRange).map(time => {
                    const date = new Date(time);
                    return `${date.getHours()}시`; 
                });

                if (todayStartTimes.length > 0) {
                    adventureIslands.push({
                        name: ContentsName,
                        icon: ContentsIcon,
                        times: todayStartTimes
                    });

                    let isRewardFound = false;
                    if (Array.isArray(RewardItems)) {
                        RewardItems.forEach(reward => {
                            if (reward && Array.isArray(reward.Items)) {
                                reward.Items.forEach(item => {
                                    if (!item.StartTimes || item.StartTimes.some(isWithinTimeRange)) {
                                        let found = false;
                                        for (let key in rewards) {
                                            if (item.Name.includes(key)) {
                                                rewards[key].islands.push(ContentsName);
                                                rewards[key].icon = item.Icon;
                                                found = true;
                                            }
                                        }
                                        if (!found && item.Name.includes('실링')) {
                                            rewards['실링'].islands.push(ContentsName);
                                        }
                                        isRewardFound = isRewardFound || found;
                                    }
                                });
                            }
                        });
                    }
                    rewards['실링'].islands = rewards['실링'].islands.filter(island => 
                        !rewards['골드'].islands.includes(island) && 
                        !rewards['카드 팩'].islands.includes(island) && 
                        !rewards['대양의 주화'].islands.includes(island) && 
                        !rewards['크림스네일의 동전'].islands.includes(island)
                    );
                }
            }
        });

        return {
            todayFormatted: today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
            fieldBoss,
            chaosGate,
            adventureIslands,
            rewards
        };

    } catch (error) {
        console.error('Error fetching content:', error);
        return {
            todayFormatted: 'N/A',
            fieldBoss: { icon: '', name: '' },
            chaosGate: { icon: '', name: '' },
            adventureIslands: [],
            rewards
        };
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
        const { todayFormatted, fieldBoss, chaosGate, adventureIslands, rewards } = await getGameContents();

        let description = '';

        if (fieldBoss.name) {
            description += `**${fieldBoss.icon} ${fieldBoss.name}** 에 참여해요!\n매 시 정각 (+3분)에 출현해요!\n`;
        }
        if (chaosGate.name) {
            description += `**${chaosGate.icon} ${chaosGate.name}** 에 참여해요!\n매 시 정각 (+3분)에 출현해요!\n`;
        }
        description += '\n**모험섬 일정**\n';

        if (adventureIslands.length > 0) {
            const uniqueTimes = [...new Set(adventureIslands.flatMap(island => island.times))];
            description += `⏰ ${uniqueTimes.join(' ')}`;

            description += '\n\n**오늘 모험섬의 주요 보상은 아래와 같아요!**\n';
            for (const [rewardName, data] of Object.entries(rewards)) {
                if (rewardName !== '실링' && data.islands.length > 0) {
                    const icon = ICONS[rewardName];
                    description += `${icon} **${rewardName}** - ${[...new Set(data.islands)].map(island => `**${island}**`).join(', ')}\n`;
                }
            }

            if (rewards['실링'].islands.length > 0) {
                description += `${ICONS['실링']} **실링** - ${[...new Set(rewards['실링'].islands)].map(island => `**${island}**`).join(', ')}\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`오늘의 주요 컨텐츠 - ${todayFormatted}`)
            .setDescription(description)
            .setColor('Green')
            .setTimestamp(new Date())
            .setFooter({ text: '작고 귀여운 블레이드의 꽃미남 블코틴' });

        console.log('Sending embed message to channel...');
        channel.send({ embeds: [embed] })
            .then(() => console.log('Notification embed sent successfully'))
            .catch(error => console.error('Error sending notification embed:', error));
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
        }, {
            timezone: 'Asia/Seoul' 
        });
    }
};

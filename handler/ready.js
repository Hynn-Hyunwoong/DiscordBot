const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { mainChannelId, guildId } = require('../config/environment');
const initializeLogChannel = require('../utils/log');
const { saveMessageId } = require('../utils/messageStorage');

module.exports = {
    name: 'ready',
    run: async (client) => {
        console.log('Bot is ready!');
        await initializeLogChannel(client, mainChannelId);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.error(`Guild with ID ${guildId} not found`);
            return;
        }
        try {
            const channel = await guild.channels.fetch(mainChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(
                        '**✨고객센터✨ : ✨토핑✨**\n\n' +
                        '이용방법\n' +
                        '원하시는 문의 종류에 따라 아래 버튼을 눌러주세요\n' +
                        '**1. 문의/건의** : ``토핑서버, 길드에 관한 문의 건의사항``\n' +
                        '**2. 별명변경** : ``토핑서버에서 불릴 닉네임 변경``\n\n' +
                        '이후 생성된 채널에서 새얀 관리자와 대화하실 수 있습니다\n' +
                        '\n' +
                        '**참고사항**\n' +
                        '문의내역이 완료 되면 관리자가 삭제합니다'
                    );
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket.1')
                            .setLabel('문의/건의')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ticket.2')
                            .setLabel('별명변경')
                            .setStyle(ButtonStyle.Primary)
                    );

                const sentMessage = await channel.send({ embeds: [embed], components: [row] });
                client.lastMessageId = sentMessage.id; // Save the last message ID
                saveMessageId(client.lastMessageId);
            } else {
                console.log(`Channel with ID ${mainChannelId} not found in guild: ${guild.name}`);
            }
        } catch (error) {
            console.error(`Could not fetch or send message to channel with ID ${mainChannelId}: ${error}`);
        }

        const noticeNicknameUserHandler = require('./nickname/manageNicknameHistory');
        await noticeNicknameUserHandler.initializeCache(client);

        const noticeYoutubeHandler = require('../handler/youtube/noticeYoutube');
        noticeYoutubeHandler.run(client);
    },
};

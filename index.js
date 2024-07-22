console.log('Starting bot...');
require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember]
});

client.commands = new Collection();
const token = process.env.DISCORD_TOKEN;
const logChannelId = process.env.DISCORD_MAINCHANNELID;
const guildId = process.env.DISCORD_GUILDID;
const youtubeAPIKEY = process.env.YOUTUBE_APIKEY;

client.login(token).catch(err => {
    console.error('Login failed:', err)
});

const handledInteractions = new Set();

client.on('ready', async () => {
    console.log('Bot is ready!');
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

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error(`Guild with ID ${guildId} not found`);
        return;
    }

    console.log(`Checking guild: ${guild.name} (ID: ${guild.id})`);
    try {
        const channel = await guild.channels.fetch(logChannelId);
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

            await channel.send({ embeds: [embed], components: [row] });
        } else {
            console.log(`Channel with ID ${logChannelId} not found in guild: ${guild.name}`);
        }
    } catch (error) {
        console.error(`Could not fetch or send message to channel with ID ${logChannelId}: ${error}`);
    }

    // 별명 캐시 초기화
    const noticeNicknameUserHandler = require('./events/noticeNicknameUser.js');
    await noticeNicknameUserHandler.initializeCache(client);

    // YouTube 알림 기능 추가
    const noticeYoutubeHandler = require('./events/noticeYoutube.js');
    noticeYoutubeHandler.run(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (handledInteractions.has(interaction.id)) {
        console.log(`Interaction ${interaction.id} already handled.`);
        return;
    }
    handledInteractions.add(interaction.id);

    const command = client.commands.get(interaction.customId);
    if (!command) return;
    try {
        await command.run(interaction);
    } catch (error) {
        console.error(`Error running command for interaction ID ${interaction.id}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '작업을 수행할 수 없습니다. 관리자에게 문의하세요', ephemeral: true });
        } else if (interaction.deferred) {
            await interaction.editReply({ content: 'There was an error while executing this command!' });
        }
    } finally {
        handledInteractions.delete(interaction.id);
    }
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.name === 'ready') {
        client.once(event.name, (...args) => event.run(...args, client));
    } else {
        client.on(event.name, (...args) => event.run(...args, client));
    }
    if (event.customId) {
        client.commands.set(event.customId, event);
    }
}

// 삭제 핸들러
const deleteHandler = require('./events/deleteHandler');
if (deleteHandler.customId) {
    client.commands.set(deleteHandler.customId, deleteHandler);
}

// 메시지 업데이트 핸들러
const messageUpdateHandler = require('./events/messageUpdate');
if (messageUpdateHandler.customId) {
    client.commands.set(messageUpdateHandler.customId, messageUpdateHandler);
}

// 메시지 삭제 핸들러
const messageDeleteHandler = require('./events/messageDelete');
if (messageDeleteHandler.customId) {
    client.commands.set(messageDeleteHandler.customId, messageDeleteHandler)}

// 초대 코드 생성 이벤트 핸들러
const inviteHistoryHandler = require('./events/inviteHistory.js');
client.on('inviteCreate', (invite) => {
    inviteHistoryHandler.run(invite, client);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

console.log('Bot setup complete');

module.exports = client;


// // 이모지 리액션 추가 이벤트 핸들러
// const messageReactionAddHandler = require('./events/messageReactionAdd');
// client.on('messageReactionAdd', (reaction, user) => {
//     console.log(`Reaction added by ${user.tag} on message ${reaction.message.id}`);
//     messageReactionAddHandler.run(reaction, user, client);
// });

// // 이모지 리액션 삭제 이벤트 핸들러
// const messageReactionRemoveHandler = require('./events/messageReactionRemove');
// client.on('messageReactionRemove', (reaction, user) => messageReactionRemoveHandler.run(reaction, user, client));

// // 멤버 추가 이벤트 핸들러
// const guildMemberAddHandler = require('./events/guildMemberAdd');
// client.on('guildMemberAdd', member => guildMemberAddHandler.run(member, client));

// // 멤버 수정 이벤트 핸들러
// const guildMemberUpdateHandler = require('./events/guildMemberUpdate');
// client.on('guildMemberUpdate', (oldMember, newMember) => guildMemberUpdateHandler.run(oldMember, newMember, client));

// // 멤버 제거 이벤트 핸들러
// const guildMemberRemoveHandler = require('./events/guildMemberRemove');
// client.on('guildMemberRemove', member => guildMemberRemoveHandler.run(member, client));

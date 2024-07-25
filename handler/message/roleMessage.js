const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { unauthorizedId, guildId, chatchannelId, authorizedId, authorizedMsgId, mainChannelId } = require('../../config/environment');

async function sendRoleMessage(client) {
    console.log('roleMessage event triggered');

    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.error(`Guild with ID ${guildId} not found`);
            return;
        }
        console.log(`Guild found: ${guild.name}`);

        await guild.members.fetch();
        const role = await guild.roles.fetch(unauthorizedId);
        if (!role) {
            console.error(`Role with ID ${unauthorizedId} not found`);
            return;
        }

        console.log(`Role found: ${role.name} with ${role.members.size} members`);

        if (role.members.size === 0) {
            console.log('No members with the role, skipping message send.');
            return;
        }
        const channel = guild.channels.cache.get(chatchannelId);
        if (!channel) {
            console.error(`Channel with ID ${chatchannelId} not found`);
            return;
        }
        const authorizedChannelLink = `https://discord.com/channels/${guildId}/${authorizedId}`;
        const messageLink = `${authorizedChannelLink}/${authorizedMsgId}`;
        const mainChannelLink = `https://discord.com/channels/${guildId}/${mainChannelId}`;
        const rolechangeLink=`https://discord.com/channels/655378879145312256/1153285501843939360/1172480019927404555`;
        const authorLink = 'https://discord.com/users/556795538394185738';
        const nickname = '블코틴';
        const editDate = new Date().toLocaleDateString();

        const memberTags = role.members.map(member => `<@${member.id}>`).join(', ');
        const embed = new EmbedBuilder()
            .setTitle('**아직 원정대 인증을 완료하지 않았어요**')
            .setDescription(
                `${memberTags}\n\n` +
                `원정대 인증을 해야 토핑디코의 모든 기능을 편하게 이용할 수 있어요!\n` +
                `**[채널명](${authorizedChannelLink}) 내의 [메시지](${messageLink})로 이동해서 원정대 인증을 완료해주세요!\n**` +
                `**이 메시지는 원정대인증이 필요한 모든 사용자에게 자동으로 발송되요!\n**` +
                `\n` +
                `만약 로아를 하고있지 않은 사용자라면 [토핑문의](${mainChannelLink}) 에 문의하여 이 메시지를 받지 않도록 요청할 수 있어요!\n\n` +
                `혹은 여기서 직접 수정할수도 있어요! [[채널 및 역할](${rolechangeLink})]` +
                `\n` +
                `토핑봇 by.기본설정도우미 **${editDate} - [@${nickname}](${authorLink})**`
            )
            .setTimestamp(new Date())
            .setColor('Orange');
        channel.send({ embeds: [embed] })
            .then(() => console.log(`Message sent in channel`))
            .catch(error => console.error(`Could not send message in channel: ${error}`));
    } catch (error) {
        console.error('Error occurred in roleMessage event:', error);
    }
}

module.exports = {
    name: 'ready',
    async run(client) {
        // await sendRoleMessage(client);
        cron.schedule('0 */12 * * *', () => {
            console.log('Running scheduled task for roleMessage');
            sendRoleMessage(client).catch(console.error);
        });
    }
};

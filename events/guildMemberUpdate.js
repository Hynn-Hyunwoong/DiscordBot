require('dotenv').config();
const { Events, EmbedBuilder, GuildMember, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    /**
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     */
    async run(oldMember, newMember) {
        if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

        const logChannelId = process.env.DISCORD_HISTORYCHANNELID;
        const logChannel = newMember.guild.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel with ID ${logChannelId} not found.`);
            return;
        }

        const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
        const deletionLog = fetchedLogs.entries.first();

        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            oldMember.roles.cache.forEach((role) => {
                if (!newMember.roles.cache.has(role.id)) {
                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('멤버 수정')
                        .addFields(
                            { name: '유저', value: `> ${newMember.displayName}(\`${newMember.id}\`)` },
                            { name: '역할 삭제', value: `${role}(\`${role.id}\`)` },
                        );
                    if (deletionLog) {
                        const executor = deletionLog.executor;
                        const target = deletionLog.target;
                        if (target.id === newMember.id && executor.id !== newMember.id) {
                            embed.addFields({
                                name: '수정유저',
                                value: `<@${executor.id}>` + '(`' + executor.id + '`)',
                            });
                        }
                    }
                    logChannel.send({ embeds: [embed] });
                }
            });
        } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            newMember.roles.cache.forEach((role) => {
                if (!oldMember.roles.cache.has(role.id)) {
                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('멤버 수정')
                        .addFields(
                            { name: '유저', value: `> ${newMember.displayName}(\`${newMember.id}\`)` },
                            { name: '역할 추가', value: `${role}(\`${role.id}\`)` },
                        );
                    if (deletionLog) {
                        const executor = deletionLog.executor;
                        const target = deletionLog.target;
                        if (target.id === newMember.id && executor.id !== newMember.id) {
                            embed.addFields({
                                name: '수정유저',
                                value: `<@${executor.id}>` + '(`' + executor.id + '`)',
                            });
                        }
                    }
                    logChannel.send({ embeds: [embed] });
                }
            });
        }
    }
};

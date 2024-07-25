const { Events, EmbedBuilder, GuildMember, AuditLogEvent } = require('discord.js');
const { generalHistoryChannelId } = require('../../config/environment');

module.exports = {
    name: Events.GuildMemberUpdate,
    /**
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     */
    async run(oldMember, newMember) {
        if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
        const logChannel = newMember.guild.channels.cache.get(generalHistoryChannelId);
        if (!logChannel) {
            console.error(`Log channel with ID ${generalHistoryChannelId} not found.`);
            return;
        }
        const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate });
        const deletionLog = fetchedLogs.entries.first();
        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            oldMember.roles.cache.forEach((role) => {
                if (!newMember.roles.cache.has(role.id)) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('멤버의 역할이 수정되었어요.')
                        .addFields(
                            { name: '적용받는 사용자는 이사람이에요', value: `<@${newMember.id}> <${newMember.id}> (\`${newMember.displayName}\`)` },
                            { name: '이 역할을 삭제했어요!', value: `${role}(\`${role.id}\`)` },
                        );
                    if (deletionLog) {
                        const executor = deletionLog.executor;
                        const target = deletionLog.target;
                        if (target.id === newMember.id && executor.id !== newMember.id) {
                            embed.addFields({
                                name: '역할을 수정한 관리자는 이사람이에요!',
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
                        .setTitle('멤버의 역할이 수정되었어요.')
                        .addFields(
                            { name: '적용받는 사용자는 이사람이에요', value: `<@${newMember.id}> <${newMember.id}> (\`${newMember.displayName}\`)` },
                            { name: '이 역할을 추가했어요!', value: `${role}(\`${role.id}\`)` },
                        );
                    if (deletionLog) {
                        const executor = deletionLog.executor;
                        const target = deletionLog.target;
                        if (target.id === newMember.id && executor.id !== newMember.id) {
                            embed.addFields({
                                name: '역할을 수정한 관리자는 이사람이에요!',
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

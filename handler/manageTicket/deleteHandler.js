const { Events, ButtonInteraction } = require('discord.js');
const { adminId } = require('../../config/environment');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'delete',
    /**
     * @param {ButtonInteraction} interaction 
     */
    async run(interaction) {
        if (interaction.customId !== 'delete') return;
        if (!interaction.member.roles.cache.get(adminId)) {
            await interaction.reply({ content: '관리자만 이 작업을 수행할 수 있습니다.', ephemeral: true });
            return;
        }

        try {
            await interaction.channel.delete();
        } catch (error) {
            console.error(`Error deleting channel: ${error}`);
            await interaction.reply({ content: '채널을 삭제하는 중 오류가 발생했습니다.', ephemeral: true });
        }
    }
};

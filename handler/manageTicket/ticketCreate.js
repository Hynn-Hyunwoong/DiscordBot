module.exports = {
    name: 'ticketCreate',
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        const handledInteractions = new Set();
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
    },
};

const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'ticket.2',
    /**
     * @param {ButtonInteraction} interaction 
     */
    async run(interaction) {
        if (interaction.customId !== 'ticket.2') return;

        const username = interaction.user.globalName; 
        const channelName = `별명변경-${username}`;

        const existingChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName);
        if (existingChannel) {
            await interaction.reply({ content: `이미 생성된 티켓이 있습니다: ${existingChannel}`, ephemeral: true });
            return;
        }

        try {
            await interaction.deferReply({ ephemeral: true });
            const categoryId = '1163799226271150231'; 
            const categoryChannel = interaction.guild.channels.cache.get(categoryId);
            if (!categoryChannel || categoryChannel.type !== 4) {
                throw new Error(`Category channel with ID ${categoryId} does not exist or is not a category.`);
            }

            const channel = await interaction.guild.channels.create({
                name: channelName, 
                parent: categoryId,
                type: 0, 
                topic: `${interaction.user} 님의 티켓입니다. 별명을 변경하기 위한 상담을 시작하겠습니다. 잠시만 기다려주세요 👀`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ['ViewChannel']
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'ReadMessageHistory']
                    }
                ]
            });
            await interaction.editReply({ content: `티켓이 생성되었습니다: ${channel}` });
            await channel.send({
                content: `${interaction.user}`,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`티켓`)
                        .setDescription(`${interaction.user} 님의 티켓\n티켓 종료는 관리자가 합니다. 감사합니다`)
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId(`delete`)
                            .setLabel(`종료(관리자 전용)`)
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            });
        } catch (error) {
            console.error(`Error creating nickname change channel: ${error} c2-4-a`);
            try {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: '티켓을 생성하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '티켓을 생성하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.', ephemeral: true });
                }
            } catch (err) {
                console.error('Error while replying to the interaction: c2Le', err);
            }
        }
    }
};

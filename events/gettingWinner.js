const { Events, Message } = require('discord.js')

module.exports = {
  name: Events.MessageCreate,
  /**
   * @param {Message} message 
   */
  async run(message) {
    if (message.content == '!추첨') {
      if (!message.reference) return;
    const channel = await message.guild?.channels.cache.get(message.reference.channelId);
    const targetMessage = await channel.messages.fetch(message.reference.messageId);
      const reaction = await targetMessage.reactions.cache.get('✅');
      if (!reaction) return await message.reply('✅ 반응이 없습니다.');
      const users = await reaction.users.fetch();
      const userList = [...users.values()].filter(user => !user.bot);
      if (userList.length > 0) {
        const winner = userList[Math.floor(Math.random() * userList.length)];
        await message.channel.send(`축하합니다! ${winner}님이 당첨되었습니다!`);
      } else {
        await message.reply('추첨할 사용자가 없습니다.');
      }
    } else if (message.content == '!추첨시작') {
      await message.reply(`추첨을 위해 아래 반응을 눌러보세요!`).then(async (message) => { await message.react('✅') });
    }
  }
}

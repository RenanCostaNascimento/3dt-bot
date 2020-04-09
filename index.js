require('dotenv').config();
const Discord = require('discord.js');

const handleMessage = require('./messageHandler');
let rpgLigado = true;

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(process.env.AUTH_TOKEN);

bot.on('ready', function () {
  console.log('running');
});

bot.on('message', async (msg) => {
  const { content: message, author: { username: user }, channel: { id: channelID } } = msg;
  const args = message.split(/\s+/);

  if (message.startsWith('!rpg')) {
    rpgLigado = !rpgLigado;
    if (rpgLigado) {
      return msg.reply('RPG ligado');
    }
    return msg.reply('RPG desligado');
  }

  if (rpgLigado) {
    const response = await handleMessage(args, user, channelID);
    if (response) {
      msg.reply(response, { split: true });
    }
  }
});
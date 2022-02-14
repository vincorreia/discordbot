require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});


client.login(process.env.CLIENT_TOKEN);

client.on('message', msg => {
    if(msg.content.toLowerCase() === 'ping'){
        msg.reply('Pong!');
    }
});
const { Client, GatewayIntentBits, Events } = require('discord.js');
const Groq = require('groq-sdk');
const config = require('./config.json');

const groq = new Groq({ apiKey: config.groqApiKey });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'QC Devs', type: 'PLAYING' }],
    status: 'online',
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || message.channel.id !== config.channelId) return;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message.content,
        },
      ],
      model: 'llama3-8b-8192',
    });

    let aiReply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again later.";

    if (aiReply.length > 2000) {
      aiReply = aiReply.substring(0, 2000);
      aiReply += "...";
    }

    await message.reply(aiReply);
  } catch (error) {
    console.error('Error interacting with API:', error);
    await message.reply("I'm having trouble connecting to the AI service. Please try again later.");
  }
});

client.login(config.token);

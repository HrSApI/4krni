require("dotenv/config");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
} = require("@discordjs/voice");
const fs = require("fs");
const ms = require("ms");
const path = require("path");
const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
});


client.on(Events.ClientReady, () => {
  console.log("Bot is ready");
});

const prefix = "!";

client.on(Events.MessageCreate, async (message) => {
  const cmd = message.content.split(" ")[0];

  if (cmd === prefix + "join") {
    //join room
    const channel = message.guild.channels.cache.get(
      message.member.voice.channelId
    );
    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const audioFiles = fs.readdirSync("./audios");
      const randomFile =
        audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const filePath = path.join("./audios", randomFile);

      const resource = createAudioResource(filePath);

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });

      message.reply("I have successfully connected to the channel!");
      player.play(resource);
      connection.subscribe(player);

      setInterval(async () => {
        const audioFiles = fs.readdirSync("./audios");
        const randomFile =
          audioFiles[Math.floor(Math.random() * audioFiles.length)];
        const filePath = path.join("./audios", randomFile);

        const resource = createAudioResource(filePath);
        await player.play(resource);
        connection.subscribe(player);
      }, ms("20s"));
      player.on("error", (error) => {
        console.error(
          `Error: ${error.message} with resource ${error.resource.metadata.title}`
        );
      });
    } else {
      message.reply("You need to join a voice channel first!");
    }
  }
});

client.login(process.env.TOKEN);

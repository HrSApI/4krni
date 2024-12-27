// استدعاء المكتبات والاعتماديات اللازمة
// Import required libraries and dependencies
require("dotenv/config"); // لقراءة المتغيرات من ملف .env
const { Client, GatewayIntentBits, Events } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
} = require("@discordjs/voice");
const fs = require("fs"); // للعمل مع الملفات
const ms = require("ms"); // لتحويل الوقت إلى ميلي ثانية
const path = require("path"); // للتعامل مع مسارات الملفات

// إنشاء كائن عميل البوت
// Create a Discord bot client
const client = new Client({
  intents: [Object.keys(GatewayIntentBits)], // استخدام جميع النوايا المتوفرة
});

// حدث عند جاهزية البوت
// Event when the bot is ready
client.on(Events.ClientReady, () => {
  console.log("Bot is ready"); // طباعة رسالة لتأكيد جاهزية البوت
});

const prefix = "!"; // بادئة الأوامر

// حدث عند تلقي رسالة
// Event when a message is created
client.on(Events.MessageCreate, async (message) => {
  const cmd = message.content.split(" ")[0]; // استخراج الأمر

  if (cmd === prefix + "join") {
    // الانضمام إلى الغرفة الصوتية
    // Join the voice channel
    const channel = message.guild.channels.cache.get(
      message.member.voice.channelId
    );

    if (channel) {
      // إنشاء الاتصال بالغرفة الصوتية
      // Create a connection to the voice channel
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // قراءة جميع الملفات الصوتية من المجلد audios
      // Read all audio files from the audios folder
      const audioFiles = fs.readdirSync("./audios");
      const randomFile =
        audioFiles[Math.floor(Math.random() * audioFiles.length)]; // اختيار ملف عشوائي
      const filePath = path.join("./audios", randomFile);

      // إنشاء مصدر الصوت
      // Create an audio resource
      const resource = createAudioResource(filePath);

      // إنشاء مشغل الصوت
      // Create an audio player
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause, // سلوك المشغل عند عدم وجود مستمعين
        },
      });

      // إرسال رسالة نجاح
      // Send a success message
      message.reply("I have successfully connected to the channel!");

      // تشغيل الصوت
      // Play the audio
      player.play(resource);
      connection.subscribe(player);

      // تشغيل ملفات عشوائية كل 20 ثانية
      // Play random files every 20 seconds
      setInterval(async () => {
        const audioFiles = fs.readdirSync("./audios");
        const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
        const filePath = path.join("./audios", randomFile);

        const resource = createAudioResource(filePath);
        await player.play(resource);
        connection.subscribe(player);
      }, ms("20s")); // time with ms

      // التعامل مع الأخطاء في المشغل
      // Handle player errors
      player.on("error", (error) => {
        console.error(
          `Error: ${error.message} with resource ${error.resource.metadata.title}`
        );
      });
    } else {
      // إذا لم يكن المستخدم في غرفة صوتية
      // If the user is not in a voice channel
      message.reply("You need to join a voice channel first!");
    }
  }
});

// تسجيل الدخول باستخدام رمز التوكن
// Login using the bot token
client.login(process.env.TOKEN);

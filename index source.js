const {Client, Intents, NewsChannel, VoiceChannel, VoiceState, Message} = require('discord.js');
const CONFIG = require('./config.json');
const {getAudioUrl} = require('google-tts-api');
const bot = new Client(
    {intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
let busyMess = " ";
let busyMode = false;
bot.login(CONFIG.token);

bot.on('ready',function(){
    console.log("Boi TTS bot ready!");
})


// Bắt sự kiện người chơi truy cập vào kênh

bot.on('voiceStateUpdate', (oldState,newState)=>{
    const oldUserChannel = oldState.channelID;
    const newUserChannel = newState.channelID


    if(oldUserChannel === null && newUserChannel !== null){
        if(bot.user.username !== oldState.member.displayName && busyMode == true){
            readingVoice("Xin chào "+oldState.member.displayName +" "+busyMess,newState.channel)
        }else if(bot.user.username !== oldState.member.displayName){
            readingVoice("Xin chào "+oldState.member.displayName,newState.channel)
        }
    }else if(newUserChannel === null){
        if(bot.user.username !== oldState.member.displayName){
        }
        
    }

    

})

async function readingVoice(text,voiceChannel){
    const audioURL = await getAudioUrl(text, {
        lang: 'vi',
        slow: false,
        host: 'https://translate.google.com',
        timeout: 10000,
    });
    try{
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play(audioURL);
            dispatcher.on('finish', ()=>{
                voiceChannel.leave();
            });
        })
    }
    catch(e){
        console.log('Bot có thể đang gặp vấn đề vui lòng thử lại sau.')
    }

}
// Lệnh nói
bot.on('message', async message => {
    const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/g);
    const text = args.slice(1).join(" ");

    if(args[0] == CONFIG['lenh-tts']){
        const voiceChannel = message.member.voice.channel;
        if(text <= 0) return message.channel.send("Vui lòng nhập nội dung cần nói");
        if(!voiceChannel) return message.channel.send("Bạn cần phải kết nối với một kênh voice chat để sử dụng lệnh này");
        readingVoice(text,voiceChannel)

    }
    
})

bot.on('message', async message => {
    const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/g);
    const text = args.slice(1).join(" ");

    if(args[0] == CONFIG['lenh-busy']){
        if(text <= 0) return message.channel.send("Vui lòng nhập nội dung cần nói");
        busyMode = true;
        busyMess = text;
        message.channel.send("Bạn vừa set chế độ BOT sang \"Bạn rộn\" BOT sẽ xin chào \"người dùng\" "+busyMess+".");
    }


    if(args[0] == CONFIG['lenh-free']){
        busyMode = false;
        message.channel.send("Bạn vừa set chế độ BOT sang \"rãnh rỗi\" BOT sẽ chào hỏi bình thường.")
    }
})

bot.on('message', async message => {
    if(message.content === CONFIG.prefix+CONFIG['lenh-showmess']){
        if(busyMess == " "){
            message.channel.send(`\n
            Tin nhắn bận: Không có lời nhắn\nChế độ: ${(busyMess == " ") ? "Rãnh rỗi" : "Đang Bận"}`);
        }else if(busyMess !== " "){
            message.channel.send(`\n
            Tin nhắn bận: ${busyMess}\nChế độ: ${(busyMess == " ") ? "Rãnh rỗi" : "Đang Bận"}`);
        }
    }
})


    



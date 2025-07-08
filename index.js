const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Token & Channel
const bot = new Telegraf('7180367735:AAHnF6n3IRPrMVWPAzShKqB2JKw7nmcW-kk');
const CHANNEL_USERNAME = '@hackt2632';

// ✅ User data memory
const users = {};
const waitingForSignals = {};

// ✅ Keep Replit Alive
app.get('/', (req, res) => res.send('🤖 Bot is running on Replit!'));
app.listen(PORT, () => console.log(`🌐 Web server running at http://localhost:${PORT}`));

// ✅ Start
bot.start(async (ctx) => {
  const id = ctx.from.id;
  users[id] = { verified: false, access: null };
  await ctx.reply(
    '🔐 Pehle channel join karo 👇',
    Markup.inlineKeyboard([
      [Markup.button.url('📢 Join Channel', `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`)],
      [Markup.button.callback('✅ Verify', 'verify')]
    ])
  );
});

// ✅ Verify
bot.action('verify', async (ctx) => {
  const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id).catch(() => null);
  if (member && ['member', 'administrator', 'creator'].includes(member.status)) {
    users[ctx.from.id].verified = true;
    await ctx.reply(
      '✅ Verified! Choose access:',
      Markup.keyboard(['🆓 Free Access', '💰 Paid Access']).resize()
    );
  } else {
    await ctx.reply('❌ Pehle channel join karo.');
  }
});

// ✅ Access choice
bot.hears(['🆓 Free Access', '💰 Paid Access'], (ctx) => {
  const id = ctx.from.id;
  if (!users[id] || !users[id].verified) return ctx.reply('❌ Pehle verify karo.');

  if (ctx.message.text.includes('Free')) {
    users[id].access = 'free';
    ctx.reply('✅ Free access selected. Type "Play" to start.');
  } else {
    ctx.reply('💰 Paid Access ke liye admin se contact kare: @YourUsername');
  }
});

// ✅ Play
bot.hears(/^Play$/i, (ctx) => {
  const id = ctx.from.id;
  if (!users[id] || users[id].access !== 'free') {
    return ctx.reply('❌ Pehle access lo.');
  }
  waitingForSignals[id] = true;
  ctx.reply('📊 10 past signals bhejo (e.g. R G G R P G G G R G)', 
    Markup.keyboard(['❌ Cancel']).resize()
  );
});

// ✅ Next
bot.hears('▶️ Next', (ctx) => {
  const id = ctx.from.id;
  if (!users[id] || users[id].access !== 'free') return;

  waitingForSignals[id] = true;
  ctx.reply('📊 Dobara 10 past signals bhejo (e.g. R G G R G G G R P R)',
    Markup.keyboard(['❌ Cancel']).resize()
  );
});

// ✅ Cancel
bot.hears('❌ Cancel', (ctx) => {
  const id = ctx.from.id;
  delete waitingForSignals[id];
  ctx.reply('🚫 Cancelled. Type "Play" to restart.', Markup.removeKeyboard());
});

// ✅ Signal Input & Prediction
bot.on('text', (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text.trim().toUpperCase();

  if (!waitingForSignals[id]) return;

  const pattern = /^[RGP](\s+[RGP]){9}$/;
  if (!pattern.test(text)) {
    return ctx.reply('❌ Format galat hai. 10 signals space se do. Example: R G G P R G G G G R');
  }

  const signals = text.split(/\s+/);
  const nextPrediction = generateNextPrediction(signals);

  ctx.reply(
    `✅ Analysis Complete!
🔮 Next Prediction: ${nextPrediction}

💸 Betting stages (PKR 1000):
1️⃣ 20
2️⃣ 40
3️⃣ 60
4️⃣ 100
5️⃣ 150
6️⃣ 200
7️⃣ 250

⚠️ Har stage ko follow karo, skip na karo.`,
    Markup.keyboard(['▶️ Next', '❌ Cancel']).resize()
  );
});

// ✅ Prediction Logic
function generateNextPrediction(arr) {
  const last = arr[arr.length - 1];
  const random = Math.random();
  if (arr.includes('P') && random > 0.7) return '🟪 PURPLE';
  if (last === 'R') return '🟩 GREEN';
  if (last === 'G') return '🟥 RED';
  return '🟪 PURPLE';
}

// ✅ Start bot
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

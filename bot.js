// bot.js - Telegram Bot for Google Sheets
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');

const SHEET_ID = process.env.SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const sheets = google.sheets({ version: 'v4', auth: API_KEY });

let walletAddresses = [];
let airdrops = [];
let schedules = [];

// Helper Functions
async function saveToSheet(range, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values: [values] }
  });
}

async function deleteFromSheet(range) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range,
  });
}

// Commands
bot.start((ctx) => ctx.reply('Welcome to the Airdrop Bot!'));

bot.command('add_wallet', (ctx) => {
  const address = ctx.message.text.split(' ')[1];
  if (address) {
    walletAddresses.push(address);
    saveToSheet('Wallets!A1', [address]);
    ctx.reply('Wallet address added.');
  } else {
    ctx.reply('Please provide a wallet address.');
  }
});

bot.command('list_wallets', (ctx) => {
  if (walletAddresses.length > 0) {
    ctx.reply('Wallet Addresses:\n' + walletAddresses.join('\n'));
  } else {
    ctx.reply('No wallet addresses found.');
  }
});

bot.command('delete_wallet', (ctx) => {
  const address = ctx.message.text.split(' ')[1];
  walletAddresses = walletAddresses.filter(w => w !== address);
  deleteFromSheet('Wallets!A1');
  walletAddresses.forEach(async (w) => await saveToSheet('Wallets!A1', [w]));
  ctx.reply('Wallet address deleted.');
});

bot.command('add_airdrop', (ctx) => {
  const airdrop = ctx.message.text.split(' ').slice(1).join(' ');
  if (airdrop) {
    airdrops.push(airdrop);
    saveToSheet('Airdrops!A1', [airdrop]);
    ctx.reply('Airdrop added.');
  } else {
    ctx.reply('Please provide airdrop details.');
  }
});

bot.command('list_airdrops', (ctx) => {
  if (airdrops.length > 0) {
    ctx.reply('Airdrops:\n' + airdrops.join('\n'));
  } else {
    ctx.reply('No airdrops found.');
  }
});

bot.command('delete_airdrop', (ctx) => {
  const airdrop = ctx.message.text.split(' ').slice(1).join(' ');
  airdrops = airdrops.filter(a => a !== airdrop);
  deleteFromSheet('Airdrops!A1');
  airdrops.forEach(async (a) => await saveToSheet('Airdrops!A1', [a]));
  ctx.reply('Airdrop deleted.');
});

bot.launch();

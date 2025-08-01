const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const os = require('os');
const https = require('https');
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let ytDlpPath = null;

async function downloadYtDlp() {
  const platform = os.platform();
  const arch = os.arch();

  let url = null;
  let filename = 'yt-dlp';

  if (platform === 'win32') {
    url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    filename = 'yt-dlp.exe';
  } else if (platform === 'linux') {
    if (arch === 'x64') {
      url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
    } else if (arch === 'arm64') {
      url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_aarch64';
    } else if (arch === 'arm') {
      url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_armv7l';
    }
  } else if (platform === 'darwin') {
    url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  }

  if (!url) throw new Error(`Unsupported platform or architecture: ${platform} ${arch}`);

  const filePath = path.join(dataDir, filename);

  if (fs.existsSync(filePath)) {
    ytDlpPath = filePath;
    return;
  }

  console.log(`Downloading yt-dlp from ${url} ...`);

  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download yt-dlp. Status: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          if (platform !== 'win32') {
            fs.chmodSync(filePath, 0o755);
          }
          ytDlpPath = filePath;
          console.log(`yt-dlp downloaded to ${filePath}`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

function getDirectVideoUrl(youtubeUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ytDlpPath || !fs.existsSync(ytDlpPath)) {
        await downloadYtDlp();
      }

      exec(`"${ytDlpPath}" -f best --get-url "${youtubeUrl}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', error);
          return reject(error);
        }
        if (stderr) {
          console.error('yt-dlp stderr:', stderr);
        }
        const url = stdout.trim();
        resolve(url);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ytdl')
    .setDescription('Get direct YouTube video download URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube video URL')
        .setRequired(true)
    ),

  async run(interaction) {
    const url = interaction.options.getString('url');

    await interaction.reply('Fetching video URL...');

    try {
      const directUrl = await getDirectVideoUrl(url);
      await interaction.followUp(`Here is the direct download URL:\n${directUrl}`);
    } catch (error) {
      console.error('Command error:', error);
      await interaction.followUp('Failed to get video URL.');
    }
  },
};
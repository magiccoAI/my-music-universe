const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const { cloudsearch } = require('NeteaseCloudMusicApi');

// =================================================================
// 配置区域
// =================================================================

// 飞书导出的CSV文件路径
// 飞书导出的CSV文件路径
const CSV_FILE_PATH = path.join(__dirname, 'songs.csv');
const COVER_DIR = path.join(__dirname, 'public', 'cover');
const DATA_JSON_PATH = path.join(__dirname, 'public', 'data', 'data.json');

// =================================================================
// 主函数
// =================================================================

async function main() {
  console.log('🚀 开始处理歌曲数据...');

  // 1. 读取现有的 data.json
  let musicData = { songs: [] };
  try {
    if (fs.existsSync(DATA_JSON_PATH)) {
      const fileContent = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
      // data.json 是一个数组，我们将其加载到对象的 songs 属性中
      musicData.songs = JSON.parse(fileContent);
    } else {
      console.log('⚠️ data.json 文件不存在，将创建新文件。');
    }
  } catch (error) {
    console.error('❌ 读取或解析 data.json 时出错:', error.message);
    return; // 如果无法解析，则终止脚本
  }

  // 2. 读取CSV文件
  const songsFromCsv = await readCsvFile(CSV_FILE_PATH);

  if (songsFromCsv.length === 0) {
    console.log('🤷‍♂️ CSV文件中没有需要处理的歌曲。');
    return;
  }
  
  console.log(`📄 从CSV文件中读取到 ${songsFromCsv.length} 首歌曲。`);

  // 3. 逐一处理每首歌曲
  for (const song of songsFromCsv) {
    try {
      await processSong(song, musicData);
    } catch (error) {
      console.error(`❌ 处理歌曲 "${song['音乐标题']}" 时发生严重错误:`, error);
    }
  }
  
  // 4. 将更新后的数据(仅songs数组)写回 data.json
  try {
    fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(musicData.songs, null, 2), 'utf-8');
    console.log('💾 data.json 文件已成功更新！');
  } catch (error) {
    console.error('❌ 写入 data.json 时出错:', error.message);
  }

  console.log('✅ 所有歌曲处理完毕！');
}

// =================================================================
// 模块化功能函数 (待实现)
// =================================================================

/**
 * 读取并解析CSV文件
 * @param {string} filePath - CSV文件路径
 * @returns {Promise<Array<object>>} - 包含歌曲信息的对象数组
 */
async function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  警告: 在路径 ${filePath} 未找到CSV文件。将返回空列表。`);
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * 处理单首歌曲的完整流程
 * @param {object} song - 从CSV读取的单行歌曲信息
 * @param {object} musicData - 内存中的歌曲数据库对象
 */
async function processSong(song, musicData) {
  const songTitle = song['音乐标题'];
  const artistName = song['歌手'];
  console.log(`\n🔍 正在处理: ${songTitle} - ${artistName}`);

  // 1. 搜索歌曲 (首先尝试网易云)
  const neteaseResult = await searchNeteaseMusic(`${songTitle} ${artistName}`);

  if (neteaseResult) {
    console.log(`  ☁️ 网易云找到结果: ${neteaseResult.name} (ID: ${neteaseResult.id})`);
    
    // 2. 下载封面
    const coverFileName = await downloadCover(neteaseResult);
    if (coverFileName) {
      console.log(`  🖼️ 封面已下载: ${coverFileName}`);
      
      // 3. 更新 data.json
      updateDataJson(song, neteaseResult, coverFileName, musicData.songs);
    }

  } else {
    console.log(`  ☁️ 网易云未找到结果。`);
    // TODO: 尝试Apple Music
  }
}

/**
 * 更新内存中的 musicData 对象
 * @param {object} csvSong - 从CSV读取的歌曲信息
 * @param {object} neteaseSong - 从网易云API获取的歌曲信息
 * @param {string} coverFile - 封面文件名
 * @param {Array} songsArray - 歌曲数组
 */
function updateDataJson(csvSong, neteaseSong, coverFile, songsArray) {
  const songTitle = csvSong['音乐标题'];
  const artistName = csvSong['歌手'];

  // 检查歌曲是否已存在（增加健壮性，防止因数据残缺导致崩溃）
  const existingSong = songsArray.find(s => 
    s && s.music && s.artist && // 确保music和artist字段存在
    s.music.toLowerCase().trim() === songTitle.toLowerCase().trim() && 
    s.artist.toLowerCase().trim() === artistName.toLowerCase().trim()
  );

  if (existingSong) {
    console.log(`  🔄 歌曲 "${songTitle}" 已存在于 data.json，跳过添加。`);
    return;
  }

  // 构建新的歌曲对象
  const newSong = {
    title: csvSong['文章标题'],
    url: csvSong['文章链接'],
    date: csvSong['发布时间'],
    music: songTitle,
    artist: artistName,
    cover: `cover/${coverFile}`,
    note: csvSong['备注'],
    previewSource: `https://music.163.com/outchain/player?type=2&id=${neteaseSong.id}&auto=0&height=66`,
  };

  songsArray.push(newSong);
  console.log(`  ➕ 已将新歌曲 "${songTitle}" 添加到数据中。`);
}

/**
 * 下载专辑封面
 * @param {object} neteaseSongInfo - 网易云歌曲信息
 * @returns {Promise<string|null>} - 封面文件名或null
 */
async function downloadCover(neteaseSongInfo) {
  const coverUrl = neteaseSongInfo.al.picUrl;
  if (!coverUrl) {
    console.log('  ⚠️ 该歌曲没有封面信息。');
    return null;
  }

  // 生成一个安全的文件名，例如 "song-artist.jpg"
  const safeSongName = neteaseSongInfo.name.replace(/[\/\\?%*:|"<>]/g, '-');
  const safeArtistName = neteaseSongInfo.ar.map(a => a.name).join(', ').replace(/[\/\\?%*:|"<>]/g, '-');
  const fileName = `${safeSongName}-${safeArtistName}.jpg`;
  const filePath = path.join(COVER_DIR, fileName);

  // 确保封面目录存在
  if (!fs.existsSync(COVER_DIR)) {
    fs.mkdirSync(COVER_DIR, { recursive: true });
  }

  // 如果文件已存在，则不再下载
  if (fs.existsSync(filePath)) {
    console.log(`  👍 封面文件已存在，跳过下载。`);
    return fileName;
  }

  try {
    const response = await axios({
      method: 'GET',
      url: coverUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(fileName));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('  ❌ 下载封面时出错:', error.message);
    return null;
  }
}

/**
 * 在网易云音乐搜索歌曲
 * @param {string} keywords - 搜索关键词
 * @returns {Promise<object|null>} - 歌曲信息对象或null
 */
async function searchNeteaseMusic(keywords) {
  try {
    const response = await cloudsearch({
      keywords: keywords,
      limit: 5,
      type: 1, // 1: 单曲
    });

    if (response.status === 200 && response.body.result && response.body.result.songs && response.body.result.songs.length > 0) {
      return response.body.result.songs[0];
    }
    return null;
  } catch (error) {
    console.error('  ❌ 调用网易云API时出错:', error.message);
    return null;
  }
}


// =================================================================
// 脚本入口
// =================================================================

main().catch(error => {
  console.error('❌ 处理过程中发生错误:', error);
});

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, 'public', 'data', 'data.json');

// Helper to make HTTP requests
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirect
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Error parsing JSON from:', url);
                    console.error('Response body snippet:', data.substring(0, 200));
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function searchNetEase(keyword) {
    // Basic search endpoint
    const encoded = encodeURIComponent(keyword);
    const url = `https://music.163.com/api/search/get/web?csrf_token=&hlpretag=&hlposttag=&s=${encoded}&type=1&offset=0&total=true&limit=1`;
    try {
        const data = await fetchUrl(url);
        if (data && data.result && data.result.songs && data.result.songs.length > 0) {
            return data.result.songs[0];
        }
    } catch (e) {
        console.error('NetEase Search Error:', e.message);
    }
    return null;
}

async function getNetEaseSongDetails(ids) {
    if (!ids || ids.length === 0) return {};
    const url = `https://music.163.com/api/song/detail?ids=[${ids.join(',')}]`;
    try {
        const data = await fetchUrl(url);
        const map = {};
        if (data && data.songs) {
            data.songs.forEach(song => {
                map[song.id] = song;
            });
        }
        return map;
    } catch (e) {
        console.error('NetEase Detail Error:', e.message);
        return {};
    }
}

async function searchiTunes(keyword) {
    const encoded = encodeURIComponent(keyword);
    const url = `https://itunes.apple.com/search?term=${encoded}&media=music&limit=1`;
    try {
        const data = await fetchUrl(url);
        if (data && data.results && data.results.length > 0) {
            return data.results[0];
        }
    } catch (e) {
        console.error('iTunes Search Error:', e.message);
    }
    return null;
}

async function processData() {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(rawData);
    
    // 1. Collect all existing NetEase IDs to batch check details
    const netEaseIds = [];
    const itemMap = new Map(); // Map NetEase ID to list of items (in case of duplicates)

    data.forEach((item, index) => {
        // Extract ID from previewUrl if it exists and is NetEase
        // Format: //music.163.com/outchain/player?type=2&id=26648127&auto=0&height=66
        const match = item.previewUrl && item.previewUrl.match(/id=(\d+)/);
        if (match) {
            const id = parseInt(match[1]);
            netEaseIds.push(id);
            if (!itemMap.has(id)) itemMap.set(id, []);
            itemMap.get(id).push(index);
        }
    });

    console.log(`Found ${netEaseIds.length} existing NetEase IDs.`);

    // 2. Batch fetch details for existing IDs
    // NetEase API might have limits on URL length, so batch in chunks of 50
    const detailsMap = {};
    const chunkSize = 50;
    for (let i = 0; i < netEaseIds.length; i += chunkSize) {
        const chunk = netEaseIds.slice(i, i + chunkSize);
        console.log(`Fetching details for chunk ${i/chunkSize + 1}...`);
        const details = await getNetEaseSongDetails(chunk);
        Object.assign(detailsMap, details);
        // Add small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500)); 
    }

    // 3. Process each item
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        let modified = false;

        // If previewUrl exists and is not from NetEase, skip it to protect manual overrides.
        if (item.previewUrl && item.previewSource !== 'netease') {
            console.log(`[${i+1}/${data.length}] Skipping: ${item.title} - ${item.music} (manual override)`);
            continue;
        }

        console.log(`[${i+1}/${data.length}] Processing: ${item.title} - ${item.music}`);

        let netEaseId = null;
        let isVip = false;
        
        // Check existing NetEase ID
        const match = item.previewUrl && item.previewUrl.match(/id=(\d+)/);
        if (match) {
            netEaseId = match[1];
            const detail = detailsMap[netEaseId];
            if (detail) {
                // Fee: 0: Free, 8: VIP, 1: VIP, 4: Paid Album?
                // We assume 0 is safe. 8 and 1 are VIP.
                if (detail.fee !== 0 && detail.fee !== 3) { // 3 is usually free? verification needed. Let's assume != 0 is potentially VIP
                     console.log(`  -> Existing is VIP/Paid (Fee: ${detail.fee}). ID: ${netEaseId}`);
                     isVip = true;
                }
            } else {
                console.log(`  -> Detail not found for ID: ${netEaseId}`);
            }
        }

        // Strategy:
        // A. If empty previewUrl -> Search NetEase -> Check VIP -> If VIP Search iTunes -> Set URL
        // B. If existing VIP -> Search iTunes -> Replace URL
        
        if (!item.previewUrl || isVip) {
            const keyword = `${item.music} ${item.artist}`;
            let iTunesTrack = null;
            let newNetEaseId = null;

            // If we already know it's VIP on NetEase, go straight to iTunes
            if (isVip) {
                console.log(`  -> Searching iTunes for replacement...`);
                iTunesTrack = await searchiTunes(keyword);
            } else if (!item.previewUrl) {
                // Try NetEase first
                console.log(`  -> Searching NetEase...`);
                const neSong = await searchNetEase(keyword);
                if (neSong) {
                    console.log(`  -> Found on NetEase: ${neSong.name} (Fee: ${neSong.fee})`);
                    if (neSong.fee === 0 || neSong.fee === 3) { // Assuming 0 and 3 are free/playable
                         newNetEaseId = neSong.id;
                    } else {
                        console.log(`  -> Song is VIP on NetEase. Searching iTunes...`);
                        iTunesTrack = await searchiTunes(keyword);
                        // If iTunes fails, we might fall back to NetEase VIP link anyway?
                        // User said: "Even if NetEase player shows... it's blank". 
                        // But better than nothing? Or maybe leave empty?
                        // User said: "Can you restore them?"
                        // Let's fallback to NetEase VIP if iTunes fails, at least it shows the player.
                        if (!iTunesTrack) {
                            newNetEaseId = neSong.id; 
                        }
                    }
                } else {
                    console.log(`  -> Not found on NetEase. Searching iTunes...`);
                    iTunesTrack = await searchiTunes(keyword);
                }
            }

            // Apply changes
            if (iTunesTrack) {
                console.log(`  -> Found on iTunes: ${iTunesTrack.trackName}`);
                item.previewUrl = iTunesTrack.previewUrl;
                item.previewSource = 'itunes'; // Optional: mark source
                modified = true;
            } else if (newNetEaseId) {
                console.log(`  -> Setting NetEase ID: ${newNetEaseId}`);
                item.previewUrl = `//music.163.com/outchain/player?type=2&id=${newNetEaseId}&auto=0&height=66`;
                item.previewSource = 'netease';
                modified = true;
            } else {
                console.log(`  -> No source found.`);
            }
        }
        
        // Save progressively or at end? At end is faster but riskier if crash.
        // Let's just update the in-memory object.
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Done! Data file updated.');
}

processData();

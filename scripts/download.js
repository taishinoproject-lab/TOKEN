import fs from 'fs';
import path from 'path';
import https from 'https';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    if (!url) return resolve();
    console.log(`Downloading: ${url}`);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        console.error(`Failed to get '${url}' (${res.statusCode})`);
        return resolve();
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error downloading '${url}': ${err.message}`);
      resolve();
    });
  });
};

const fetchColbaseImage = (htmlUrl, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(htmlUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        const match = data.match(/<meta property="og:image" content="([^"]+)"/);
        if (match && match[1]) {
          await downloadImage(match[1], filepath);
        } else {
          console.error(`No og:image found for ${htmlUrl}`);
        }
        resolve();
      });
    }).on('error', err => {
      console.error(`Error fetching colbase HTML: ${err.message}`);
      resolve();
    });
  });
};

async function main() {
  const assetsDir = path.join(process.cwd(), 'src', 'assets');
  ensureDir(path.join(assetsDir, 'swords'));
  ensureDir(path.join(assetsDir, 'flyers'));

  const colbaseUrls = {
    'sword_01.jpg': 'https://colbase.nich.go.jp/collection_items/tnm/F-20103-1?locale=ja',
    'sword_02.jpg': 'https://colbase.nich.go.jp/collection_items/tnm/F-19931-1?locale=ja',
    'sword_04.jpg': 'https://colbase.nich.go.jp/collection_items/tnm/F-133?locale=ja',
    'sword_10.jpg': 'https://colbase.nich.go.jp/collection_items/tnm/F-19789?locale=ja',
    'sword_12.jpg': 'https://colbase.nich.go.jp/collection_items/tnm/F-19547?locale=ja'
  };

  const flyerUrls = {
    'ev_01.jpg': 'https://www.tetsu-museum.info/wp-content/uploads/2026/06/06e863026145d53ecfa410b8ad15c946-1-150x150.jpg',
    'ev_02.pdf': 'https://www.sanadahoumotsukan.com/up_images/eve/eve_4c7984f6.pdf',
    'ev_03.jpg': 'https://www.tnm.jp/common/images/schedule/20260414_kagamaedake_mainvisual.jpg',
    'ev_04.jpg': 'https://www.kyohaku.go.jp/jp/exhibitions/feature/b/assets/img/2026_sword_main.jpg',
    'ev_05.pdf': 'https://kitanotenmangu.or.jp/wp-content/uploads/2026/01/%E2%97%8Esp_exhA401_fr.pdf',
    'ev_06.jpg': 'https://www.touken.or.jp/Portals/0/WEB%E7%94%A8_%E7%AC%AC29%E5%9B%9E%E7%89%B9%E9%87%8D%E5%88%80%E5%89%A3%E5%B1%95%E3%83%81%E3%83%A9%E3%82%B7_page-0001.jpg',
    'ev_07.jpg': 'https://www.chido.jp/wp-content/uploads/2026/05/busoubiden_chirashi.jpg',
    'ev_08.jpg': 'https://sanobi.or.jp/snwp/wp-content/uploads/2026/08/iroha2026_700-omote.jpg',
    'ev_09.jpg': 'https://www.ishibi.pref.ishikawa.jp/wp-content/upload/2026/05/take_no_yosooi2_main.jpg'
  };

  for (const [filename, url] of Object.entries(colbaseUrls)) {
    await fetchColbaseImage(url, path.join(assetsDir, 'swords', filename));
  }

  for (const [filename, url] of Object.entries(flyerUrls)) {
    await downloadImage(url, path.join(assetsDir, 'flyers', filename));
  }
}

main();

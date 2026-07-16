import fs from 'fs';
import path from 'path';
import https from 'https';

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
};

async function main() {
  const queryUrl = 'https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&titles=%E5%A4%AA%E5%88%80&iiprop=url';
  
  https.get(queryUrl, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const json = JSON.parse(data);
      const pages = json.query.pages;
      const urls = [];
      for (const key in pages) {
        if (pages[key].imageinfo && pages[key].imageinfo[0].url) {
          urls.push(pages[key].imageinfo[0].url);
        }
      }
      
      const jpgUrls = urls.filter(url => url.toLowerCase().endsWith('.jpg'));
      
      const targets = [
        { id: 'sword_14', url: jpgUrls[0] },
        { id: 'sword_15', url: jpgUrls[1] },
        { id: 'sword_16', url: jpgUrls[2] },
        { id: 'sword_17', url: jpgUrls[3] }
      ];

      for (const target of targets) {
        if (target.url) {
          const filepath = path.join(process.cwd(), 'src', 'assets', 'swords', `${target.id}.jpg`);
          console.log(`Downloading ${target.url} to ${filepath}`);
          await downloadImage(target.url, filepath);
        }
      }
      console.log('Done!');
    });
  });
}

main();

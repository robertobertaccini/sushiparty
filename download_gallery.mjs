import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = [
  "http://sushiparty.it/assets/images/100-2000x1331-800x532.jpg",
  "http://sushiparty.it/assets/images/100-2000x2666-800x1066.jpg",
  "http://sushiparty.it/assets/images/100-1-2000x1500-800x600.jpg",
  "http://sushiparty.it/assets/images/2016-03-08-21-2000x1123-800x449.jpg",
  "http://sushiparty.it/assets/images/cimg0027-2-2000x2666-800x1066.jpg",
  "http://sushiparty.it/assets/images/2015-12-07-22-2000x3560-800x1424.jpg",
  "http://sushiparty.it/assets/images/cimg0041-2000x1500-800x600.jpg",
  "http://sushiparty.it/assets/images/12923109-10153511328643263-5362409893552790794-n-2000x2666-800x1066.jpg",
  "http://sushiparty.it/assets/images/wp-20160324-2000x3560-800x1424.jpg",
  "http://sushiparty.it/assets/images/img-20150511-wa0001-2000x1500-800x600.jpg",
  "http://sushiparty.it/assets/images/100-2000x1331.jpg",
  "http://sushiparty.it/assets/images/100-2000x2666.jpg",
  "http://sushiparty.it/assets/images/100-1-2000x1500.jpg",
  "http://sushiparty.it/assets/images/img-20160417-wa0012-2000x1500.jpg",
  "http://sushiparty.it/assets/images/altau8fjuixdlbp1tc2qpeccfw6i61lc5kgvekbaeowguho-2000x2666.jpg",
  "http://sushiparty.it/assets/images/100-3-2000x1498.jpg",
  "http://sushiparty.it/assets/images/100-4-2000x1498.jpg",
  "http://sushiparty.it/assets/images/100-5-2000x1498.jpg",
  "http://sushiparty.it/assets/images/100-6-2000x1498.jpg",
  "http://sushiparty.it/assets/images/2015-12-07-22-2000x1123.jpg",
  "http://sushiparty.it/assets/images/2016-03-08-21-2000x1123.jpg",
  "http://sushiparty.it/assets/images/cimg0027-2-2000x2666.jpg",
  "http://sushiparty.it/assets/images/2015-12-07-22-2000x3560.jpg",
  "http://sushiparty.it/assets/images/cimg0041-2000x1500.jpg",
  "http://sushiparty.it/assets/images/wp-20160324-2000x3560.jpg",
  "http://sushiparty.it/assets/images/cimg2164-2000x1500.jpg",
  "http://sushiparty.it/assets/images/img-20160417-wa0007-2000x2666.jpg",
  "http://sushiparty.it/assets/images/wp-20160312-2000x3560.jpg",
  "http://sushiparty.it/assets/images/dscn2161-2000x1500.jpg",
  "http://sushiparty.it/assets/images/picture-056-1400x934.png",
  "http://sushiparty.it/assets/images/img-600x450.jpg",
  "http://sushiparty.it/assets/images/100-1-600x449.jpg",
  "http://sushiparty.it/assets/images/img-1-600x450.jpg",
  "http://sushiparty.it/assets/images/dscn1110-600x450.jpg",
  "http://sushiparty.it/assets/images/logo-152x128.jpg"
];

// Clean up duplicate filenames - extract filenames and keep unique
const uniqueUrlsMap = new Map();
for (const u of urls) {
  const filename = path.basename(u);
  // let's prefer full size ones over smaller ones where available, but since we just want images let's just save them all
  uniqueUrlsMap.set(filename, u);
}

const dir = path.join(__dirname, 'public', 'gallery');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function run() {
  const finalUrls = Array.from(uniqueUrlsMap.values());
  for (let i = 0; i < finalUrls.length; i++) {
    const url = finalUrls[i];
    const filename = path.basename(url);
    const dest = path.join(dir, filename);
    console.log(`Downloading ${i+1}/${finalUrls.length}: ${filename}`);
    try {
      await download(url, dest);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log("Done");
}

run();

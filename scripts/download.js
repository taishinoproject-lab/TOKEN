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

async function main() {
  const assetsDir = path.join(process.cwd(), 'src', 'assets');
  ensureDir(path.join(assetsDir, 'swords'));
  ensureDir(path.join(assetsDir, 'flyers'));

  // ColBase 直リンク（作品ページの画像を右クリック→画像アドレスをコピー で取得）
  // 形式: https://colbase.nich.go.jp/media/{館}/{作品ID}/image/{作品ID}_{画像ID}.jpg
  const colbaseUrls = {
    'sword_01.jpg': 'https://colbase.nich.go.jp/media/tnm/F-20103-1/image/F-20103-1_E0137972.jpg', // 三日月宗近 F-20103-1
    'sword_02.jpg': 'https://colbase.nich.go.jp/media/tnm/F-19931/image/F-19931_E0137966.jpg', // 童子切安綱（刀身本体）F-19931 ※F-19931-1は拵なので注意
    'sword_04.jpg': 'https://colbase.nich.go.jp/media/tnm/F-19932/image/F-19932_E0137978.jpg', // 大包平 F-19932 ※F-133は同工の別作なので注意
    'sword_10.jpg': 'https://colbase.nich.go.jp/media/tnm/F-19789/image/F-19789_E0137924.jpg', // 大般若長光 F-19789
    'sword_12.jpg': 'https://colbase.nich.go.jp/media/tnm/F-19547/image/F-19547_E0137990.jpg' // 厚藤四郎 F-19547
    // sword_07.jpg（青江の大太刀）は真田宝物館公式の商品写真（実物大ポスター）を
    // 手動でトリミング済み（ポスター文字・サムネイルを除去）のため、このスクリプトの対象から除外。
    // 再取得する場合は https://www.sanadahoumotsukan.com/up_images/goo/goo_8d3c6441_resize.jpg を参照し、再度手動でトリミングすること。

    // sword_03.jpg（鬼切丸/髭切・北野天満宮）は北野天満宮公式サイトの「北野天満宮と宝刀」記事
    // 掲載画像（1000x278、同記事の図２）を手動でトリミング・保存したもの。ColBase/e国宝/
    // 文化遺産オンラインいずれにも掲載がないため、このスクリプトの対象から除外。
    // 手動調整済み・上書き禁止。
    // 再取得する場合は https://kitanotenmangu.or.jp/story/北野天満宮と宝刀/ の
    // 太刀鬼切丸_表.jpg（縦278px、これが最大解像度）を参照。

    // sword_05.jpg（数珠丸恒次・本興寺）は尼崎市公式サイト「本興寺　太刀銘恒次」ページ掲載画像
    // （642x411、拵え披露時の写真）を手動でトリミング・保存したもの。ColBase/e国宝/
    // 文化遺産オンラインいずれにも掲載がないため、このスクリプトの対象から除外。
    // 手動調整済み・上書き禁止。
    // 再取得する場合は https://www.city.amagasaki.hyogo.jp/_res/projects/default_project/_page_/001/028/861/honkouji-juzumaru.jpg
    // （642x411、これが最大解像度）を参照。

    // sword_08.jpg（脇指 銘 堀川国広・鉄の展示館／高倉健旧蔵）は鉄の展示館公式サイトの
    // サイト内検索「高倉健」結果に掲載された茎（なかご）接写画像を手動でトリミング・保存したもの。
    // 同館の展示品ページには全身像の掲載がなく、茎の切り出しのみのため、他の刀と異なり
    // 刀身全体ではなく銘部分のクローズアップとなっている点に注意。
    // 手動調整済み・上書き禁止。
    // 再取得する場合は https://tetsu-museum.sakura.ne.jp/wp/wp-content/uploads/2025/03/039_1.jpg
    // （1000x750、これが最大解像度）を参照。

    // sword_06（鶴丸国永・宮内庁三の丸尚蔵館）は2026-07-16に調査したが、ColBase（三の丸尚蔵館の
    // 収蔵品もColBase統合済みだが未収録）・e国宝（対象4館外）・文化遺産オンライン・
    // 三の丸尚蔵館公式収蔵品データベース（collection.shozokan.nich.go.jp、「太刀」で検索しても
    // 該当なし）のいずれにも画像が見つからなかった。御物であるため公開画像自体が存在しない可能性が高い。

    // sword_14〜17: 2026-07-16に調査したが、いずれも刀身の高解像度画像が見つからず、
    // 別の刀（sword_01/02/04/10）の画像が誤って割り当てられていたファイルを削除した。
    // 所蔵者が東博・京博・奈良博・九博以外（刀剣博物館／北野天満宮／前田育徳会）のため
    // ColBase・e国宝は対象外。文化遺産オンラインは該当ページ自体に画像なし（noImage）。
    //  - sword_14 則重（刀剣博物館）: 展示は撮影禁止、公開画像なし
    //  - sword_15 信濃守国広造（北野天満宮）: 公式サイトに切先のみの正方形画像
    //    (https://kitanotenmangu.or.jp/wp-content/uploads/2023/09/国広.jpg) はあるが、
    //    他の刀身画像と構成（横長・全体像）が大きく異なるため不採用
    //  - sword_16 助守（北野天満宮）: 公式サイトにあるのは拵（つば）の接写のみ
    //    (https://kitanotenmangu.or.jp/wp-content/uploads/2025/03/20190508_341-scaled-e1783644019417.jpg)、
    //    刀身画像ではないため不採用
    //  - sword_17 大典太光世（前田育徳会）: 前田育徳会は展示施設を持たず画像利用は個別申請制、公開画像なし
  };

  const flyerUrls = {
    'ev_01.jpg': 'https://www.tetsu-museum.info/wp-content/uploads/2026/06/06e863026145d53ecfa410b8ad15c946.jpg', // 鉄の展示館「第16回 新作日本刀 研磨 外装 刀職技術展覧会」チラシ 原寸大
    'ev_02.pdf': 'https://www.sanadahoumotsukan.com/up_images/eve/eve_4c7984f6.pdf',
    // ev_02.jpg / ev_50.jpg（同一PDFを共用）は上記PDFの1ページ目を手動で画像化したもの。
    // このスクリプトはPDF→画像変換を行わないため、ev_02.jpg・ev_50.jpgは自動生成されない。
    // 再取得する場合はev_02.pdfをPDFビューアで開き、1ページ目をトリミングしてev_02.jpg / ev_50.jpgとして保存すること。
    'ev_03.webp': 'https://img.hmv.co.jp/hybridimage/eventpage/772584/main.webp?20260109063531',
    // ev_04.jpg: 旧URL（kyohaku.go.jp/.../2026_sword_main.jpg）はリンク切れ(404)。
    // 公式ページ（https://www.kyohaku.go.jp/jp/exhibitions/feature/b/2026_sword/）から取得した最新のメインビジュアル。
    'ev_04.jpg': 'https://www.kyohaku.go.jp/jp/exhibitions/assets/feature/2026_sword/img_top-1200_20260204.jpg',
    'ev_05.pdf': 'https://kitanotenmangu.or.jp/wp-content/uploads/2026/01/%E2%97%8Esp_exhA401_fr.pdf',
    // ev_05.jpg は上記PDFではなく、公式サイト掲載のポスター画像（特別展「刀剣今昔―北野刀剣×現代刀―」）を手動保存したもの。
    'ev_06.jpg': 'https://www.touken.or.jp/Portals/0/WEB%E7%94%A8_%E7%AC%AC29%E5%9B%9E%E7%89%B9%E9%87%8D%E5%88%80%E5%89%A3%E5%B1%95%E3%83%81%E3%83%A9%E3%82%B7_page-0001.jpg',
    // ev_23.jpg はev_06と同一展覧会（第29回特別重要刀剣等新指定展）のためev_06.jpgと同内容。
    'ev_07.jpg': 'https://www.chido.jp/wp-content/uploads/2026/05/busoubiden_chirashi.jpg',
    // ev_17.jpg はev_07と同一展覧会（武装美伝―刀剣と甲冑―）のためev_07.jpgと同内容。
    'ev_08.jpg': 'https://sanobi.or.jp/snwp/wp-content/uploads/2026/08/iroha2026_700-omote.jpg',
    // ev_16.jpg はev_08と同一展覧会（さのびととくび 名刀のいろは）のためev_08.jpgと同内容。
    'ev_09.jpg': 'https://www.ishibi.pref.ishikawa.jp/wp-content/upload/2026/05/take_no_yosooi2_main.jpg', // ※リンク切れ(404)。現行公式ページにも代替画像なし（2026-07-16確認）
    'ev_18.jpg': 'https://www.city.setouchi.lg.jp/uploaded/image/130205.jpg', // テーマ展「時代の映し鏡―室町の備前刀―」
    'ev_19.jpg': 'https://www.city.setouchi.lg.jp/uploaded/image/130621.png', // 夏季特別展「知ればもっとおもしろい！ようこそ！刀剣の世界へ」
    // ev_29.jpg / ev_30.jpg（徳川美術館）: 公式サイトの展覧会一覧ページに掲載されたバナー画像を
    // スクリーンショットから手動トリミングしたもので、単体の直リンクURLは存在しない。
    // 再取得する場合は https://www.tokugawa-art-museum.jp/exhibitions/ を参照。
    'ev_32.jpg': 'https://uesugi-keishoden.jp/wp-content/uploads/2026/07/f73680d1cb668bf7e301279255c7bd68.pdf', // ※PDF。1ページ目を手動で画像化してev_32.jpgとして保存
    // ev_33.jpg（豊田市博物館）: 展覧会ページ内の画像で直リンクURLが取得できなかったため、
    // スクリーンショットから手動トリミング。再取得する場合は
    // https://hakubutsukan.city.toyota.aichi.jp/exhibitions/special/18 を参照。
    'ev_34.jpg': 'https://www.touken-tatarafudoki.com/', // ※トップページのメインビジュアルを手動トリミング。直リンクURLなし
    // ev_35.jpg（建勲神社）: トップページのヒーロー画像をスクリーンショットから手動トリミング。
    // 再取得する場合は https://kenkun-jinja.org/touken/ を参照。
    'ev_36.jpg': 'https://www.ekitag.jp/assets/images/head_pc.png' // エキタグ×刀剣乱舞ONLINE公式キャンペーンページのキービジュアル
    // ev_37.jpg はev_01と同一展覧会（第16回 新作日本刀・刀職技術展覧会）のためev_01.jpgと同内容。
  };

  for (const [filename, url] of Object.entries(colbaseUrls)) {
    if (!url) {
      console.warn(`Skip (URL未設定): ${filename}`);
      continue;
    }
    await downloadImage(url, path.join(assetsDir, 'swords', filename));
  }

  for (const [filename, url] of Object.entries(flyerUrls)) {
    await downloadImage(url, path.join(assetsDir, 'flyers', filename));
  }

  // 同一展覧会でチラシ画像を共用しているイベント（コピーで対応）
  // ※ev_16/ev_17/ev_23/ev_37は重複イベントとしてevents.tsから削除済み（2026-07-16）。
  // 画像ファイル自体は残しているが、対応するイベントレコードは存在しない。
  const duplicates = {
    'ev_50.jpg': 'ev_02.jpg'  // 真田宝物館 年間案内PDF（松代城 花の丸展を含む）
  };
  for (const [dest, src] of Object.entries(duplicates)) {
    const srcPath = path.join(assetsDir, 'flyers', src);
    const destPath = path.join(assetsDir, 'flyers', dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${src} -> ${dest}`);
    } else {
      console.warn(`Skip copy (元画像が見つかりません): ${src} -> ${dest}`);
    }
  }
}

main();

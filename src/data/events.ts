import { DEMO_TODAY } from "./constants";

export interface Event {
  id: string;
  category: "pin" | "support";
  title: string;
  venue: string;
  prefecture: string;
  city: string;
  start_date: string;
  end_date: string;
  highlight_swords: string[];
  admission: string;
  official_url: string;
  flyer_image_url: string | null;
  flyer_note: string;
  want_count_seed: number;
  confidence: string;
}

export const events: Event[] = [
  {"id":"ev_01","category":"pin","title":"源清麿と山浦一門展（仮称）","venue":"坂城町 鉄の展示館","prefecture":"長野県","city":"埴科郡坂城町","start_date":"2026-09-02","end_date":"2026-11-15","highlight_swords":["源清麿（刀）","山浦真雄（太刀）"],"admission":"一般 400円","official_url":"https://www.tetsu-museum.info/event/","flyer_image_url":"https://www.tetsu-museum.info/wp-content/uploads/2026/06/06e863026145d53ecfa410b8ad15c946-1-150x150.jpg","flyer_note":"150x150サムネイル。実装時はフルサイズを再取得","want_count_seed":87,"confidence":"事実"},
  {"id":"ev_02","category":"pin","title":"特別展示 重要文化財「青江の大太刀」","venue":"真田宝物館","prefecture":"長野県","city":"長野市松代町","start_date":"2026-04-29","end_date":"2026-05-11","highlight_swords":["大太刀 銘 備中国住人助次（重要文化財・号 青江の大太刀）"],"admission":"一般 600円","official_url":"https://www.sanadahoumotsukan.com/event-info.php?n=172","flyer_image_url":"https://www.sanadahoumotsukan.com/up_images/eve/eve_4c7984f6.pdf","flyer_note":"PDF。画像化して使用","want_count_seed":154,"confidence":"事実"},
  {"id":"ev_03","category":"pin","title":"前田育徳会創立百周年記念 特別展「百万石！加賀前田家」","venue":"東京国立博物館 平成館","prefecture":"東京都","city":"台東区上野公園","start_date":"2026-04-14","end_date":"2026-06-07","highlight_swords":["太刀 銘 光世作（国宝・号 大典太）","短刀 銘 吉光（重要文化財・号 前田藤四郎）","刀 無銘 義弘（国宝・号 富田江）","刀 無銘 正宗（国宝・号 太郎作正宗）","刀 切付銘 朝倉篭手切太刀也（名物 籠手切正宗）"],"admission":"一般 2,300円","official_url":"https://www.tnm.jp/modules/r_free_page/index.php?id=2740","flyer_image_url":"https://www.tnm.jp/common/images/schedule/20260414_kagamaedake_mainvisual.jpg","flyer_note":"メインビジュアルJPG。そのまま使用可","want_count_seed":312,"confidence":"事実"},
  {"id":"ev_04","category":"pin","title":"特集展示 縁を結ぶかたな—国宝・重要文化財で学ぶ刀剣鑑賞—","venue":"京都国立博物館 平成知新館","prefecture":"京都府","city":"京都市東山区","start_date":"2026-02-04","end_date":"2026-03-22","highlight_swords":["刀 無銘 義弘（重要文化財・号 桑名江）","短刀 銘 吉光（重要文化財・号 秋田藤四郎）","太刀 銘 安綱（国宝）","太刀 銘 則国（国宝）"],"admission":"一般 700円（名品ギャラリー料金）","official_url":"https://www.kyohaku.go.jp/jp/exhibitions/feature/b/2026_sword/","flyer_image_url":"https://www.kyohaku.go.jp/jp/exhibitions/feature/b/assets/img/2026_sword_main.jpg","flyer_note":"基準日では終了扱い。『前回の展示』表現に使用可","want_count_seed":98,"confidence":"事実"},
  {"id":"ev_05","category":"pin","title":"特別展「刀剣今昔―北野刀剣×現代刀―」","venue":"北野天満宮 宝物殿","prefecture":"京都府","city":"京都市上京区","start_date":"2026-02-01","end_date":"2026-06-14","highlight_swords":["太刀 銘 安綱（重要文化財・号 鬼切丸／髭切）","脇指 銘 助丸（北野天満宮蔵）","静形薙刀（北野天満宮蔵）","現代刀：月山貞利","現代刀：宮入小左衛門行平"],"admission":"大人 1,000円","official_url":"https://kitanotenmangu.or.jp/guidance/houmotsuden/","flyer_image_url":"https://kitanotenmangu.or.jp/wp-content/uploads/2026/01/%E2%97%8Esp_exhA401_fr.pdf","flyer_note":"PDF。画像化して使用","want_count_seed":203,"confidence":"事実"},
  {"id":"ev_06","category":"support","title":"第29回 特別重要刀剣等 新指定展 [推定・要確認]","venue":"刀剣博物館","prefecture":"東京都","city":"墨田区","start_date":"2026-06-06","end_date":"2026-07-20","highlight_swords":["特別重要刀剣の新指定品（個別の号は目録参照）"],"admission":"一般 1,000円","official_url":"https://www.touken.or.jp/museum/exhibition/exhibition.html","flyer_image_url":"https://www.touken.or.jp/Portals/0/WEB用_第29回特重刀剣展チラシ_page-0001.jpg","flyer_note":"タイトルはチラシ名から推定。要確認","want_count_seed":76,"confidence":"事実"},
  {"id":"ev_07","category":"support","title":"武装伝（刀剣乱舞ONLINEコラボ）[推定・要確認]","venue":"致道博物館","prefecture":"山形県","city":"鶴岡市","start_date":"2026-07-02","end_date":"2026-08-31","highlight_swords":["国宝 太刀 銘 信房作","国宝 太刀 銘 真光","重要文化財 短刀 銘 吉光（名物 信濃藤四郎）"],"admission":"一般 1,000円","official_url":"https://www.chido.jp/exhibition/","flyer_image_url":"https://www.chido.jp/wp-content/uploads/2026/05/busoubiden_chirashi.jpg","flyer_note":"刀剣乱舞コラボ第10弾。タイトルはファイル名から推定","want_count_seed":145,"confidence":"事実"},
  {"id":"ev_08","category":"support","title":"日本刀展（徳川美術館共同・刀剣乱舞コラボ）[推定・要確認]","venue":"佐野美術館","prefecture":"静岡県","city":"三島市","start_date":"2026-09-05","end_date":"2026-10-18","highlight_swords":["国宝 太刀 銘 正恒","国宝 太刀 銘 長光（名物 津田遠江長光）","国宝 短刀 銘 吉光（名物 後藤藤四郎）","国宝 太刀 銘 光忠","重要文化財 刀 銘 本作長義","号 蜻蛉切"],"admission":"一般 1,600円","official_url":"https://sanobi.or.jp/exhibition/japaneseswords_2026/","flyer_image_url":"https://sanobi.or.jp/snwp/wp-content/uploads/2026/08/iroha2026_700-omote.jpg","flyer_note":"国宝多数。正式名称は要確認","want_count_seed":188,"confidence":"事実"},
  {"id":"ev_09","category":"support","title":"武の装い（加賀前田家伝来）[推定・要確認]","venue":"石川県立美術館","prefecture":"石川県","city":"金沢市","start_date":"2026-06-27","end_date":"2026-08-03","highlight_swords":["加賀藩前田家伝来の刀剣・武具（前田育徳会 尊經閣文庫分館）"],"admission":"一般 370円","official_url":"https://www.ishibi.pref.ishikawa.jp/exhibition/exhibition-17400-4-2-3/","flyer_image_url":"https://www.ishibi.pref.ishikawa.jp/wp-content/upload/2026/05/take_no_yosooi2_main.jpg","flyer_note":"専用チラシなし。メインビジュアル使用","want_count_seed":41,"confidence":"事実"},
  {"id":"ev_10","category":"support","title":"長曽祢虎徹と津田助広（新刀の東西横綱）[推定・要確認]","venue":"刀剣博物館（ふくやま美術館 合同）","prefecture":"東京都","city":"墨田区","start_date":"2026-10-24","end_date":"2026-12-20","highlight_swords":["長曽祢虎徹","津田越前守助広"],"admission":"不明（通常 1,000円程度）","official_url":"https://www.touken.or.jp/museum/exhibition/schedule.html","flyer_image_url":null,"flyer_note":"チラシ未取得。会期・名称ともに推定含む。プレースホルダーで代替","want_count_seed":59,"confidence":"推定"}
];

export const getEventStatus = (event: Event) => {
  if (DEMO_TODAY < event.start_date) return "upcoming";
  if (DEMO_TODAY > event.end_date) return "ended";
  return "ongoing";
};

export interface Sword {
  id: string;
  name: string;
  reading: string;
  designation: string;
  category: string;
  dimensions: string;
  era: string;
  smith: string;
  school: string;
  current_holder: string;
  location: string;
  provenance: string;
  story: string;
  media_appearance: string;
  image_source_url: string;
  image_license: string;
  confidence: string;
}

export const swords: Sword[] = [
  {"id":"sword_01","name":"太刀 銘三条（名物三日月宗近）","reading":"みかづきむねちか","designation":"国宝","category":"太刀","dimensions":"刃長80.0cm 反り2.7cm","era":"平安時代","smith":"三条宗近","school":"山城国三条派","current_holder":"東京国立博物館","location":"東京都台東区","provenance":"高台院→徳川秀忠→徳川将軍家→東京国立博物館","story":"刃文に三日月形の打ち除けが複数見えることに由来。天下五剣の一つ。","media_appearance":"刀剣乱舞","image_source_url":"https://colbase.nich.go.jp/collection_items/tnm/F-20103-1?locale=ja","image_license":"出典明記で商用可・加工可","confidence":"事実"},
  {"id":"sword_02","name":"太刀 銘安綱（名物童子切安綱）","reading":"どうじぎりやすつな","designation":"国宝","category":"太刀","dimensions":"刃長80.0cm 反り2.7cm","era":"平安時代","smith":"伯耆安綱","school":"古伯耆派","current_holder":"東京国立博物館","location":"東京都台東区","provenance":"源頼光→足利将軍家→豊臣秀吉→徳川家康・秀忠→津山藩松平家→東京国立博物館","story":"源頼光が大江山の酒呑童子を斬った伝説に由来。天下五剣の一つ。","media_appearance":"刀剣乱舞","image_source_url":"https://colbase.nich.go.jp/collection_items/tnm/F-19931-1?locale=ja","image_license":"出典明記で商用可・加工可","confidence":"事実"},
  {"id":"sword_03","name":"太刀 銘安綱（鬼切丸 別名 髭切）","reading":"おにきりまる／ひげきり","designation":"重要文化財","category":"太刀","dimensions":"刃長84.4cm 反り3.7cm","era":"鎌倉時代","smith":"不明","school":"不明","current_holder":"北野天満宮","location":"京都府京都市","provenance":"源氏重代の宝刀→新田義貞→斯波高経→最上家→北野天満宮","story":"渡辺綱が一条戻橋で鬼の腕を切った伝説から鬼切。試し斬りで髭まで切れたため髭切とも。","media_appearance":"刀剣乱舞","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_04","name":"太刀 銘備前国包平作（名物大包平）","reading":"おおかねひら","designation":"国宝","category":"太刀","dimensions":"刃長89.2cm 反り3.4cm","era":"平安時代","smith":"備前国包平","school":"古備前派","current_holder":"東京国立博物館","location":"東京都台東区","provenance":"池田輝政→岡山藩池田家→東京国立博物館","story":"長大な寸法と包平作中の最高傑作。童子切と並び東西の両横綱と称される。","media_appearance":"刀剣乱舞","image_source_url":"https://colbase.nich.go.jp/collection_items/tnm/F-133?locale=ja","image_license":"出典明記で商用可・加工可","confidence":"事実"},
  {"id":"sword_05","name":"太刀 銘恒次（名物数珠丸恒次）","reading":"じゅずまるつねつぐ","designation":"重要文化財","category":"太刀","dimensions":"刃長83.9cm 反り3.0cm","era":"鎌倉時代","smith":"青江恒次","school":"備中青江派","current_holder":"本興寺","location":"兵庫県尼崎市","provenance":"日蓮→行方不明→杉原祥造が再発見→本興寺","story":"日蓮が護身用に贈られ、柄に数珠を掛け破邪顕正の剣とした。天下五剣の一つ。","media_appearance":"刀剣乱舞","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_06","name":"太刀 銘国永（名物鶴丸国永）","reading":"つるまるくになが","designation":"御物","category":"太刀","dimensions":"刃長78.63cm 反り2.73cm","era":"平安時代","smith":"五条国永","school":"五条派","current_holder":"宮内庁 三の丸尚蔵館","location":"東京都千代田区","provenance":"織田信長→伊達家→明治天皇→宮内庁","story":"細身で反り高く優美。古い拵えの鶴紋様など名の由来に諸説。","media_appearance":"刀剣乱舞","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_07","name":"大太刀（青江）銘備中国住人 延文六年二月日","reading":"あおえのおおたち","designation":"重要文化財","category":"大太刀","dimensions":"刃長103.0cm 約1.5kg","era":"南北朝時代・延文6年(1361)","smith":"備中国住人","school":"備中青江派","current_holder":"真田宝物館","location":"長野県長野市","provenance":"真田信綱→松代藩真田家→真田宝物館","story":"長篠の戦いで真田信綱が振るったと伝わり、物打ちに大きな刃こぼれが残る。","media_appearance":"なし","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_08","name":"脇指 銘 堀川国広","reading":"ほりかわくにひろ","designation":"未指定","category":"脇指","dimensions":"不明","era":"安土桃山時代","smith":"堀川国広","school":"堀川派","current_holder":"鉄の展示館","location":"長野県埴科郡坂城町","provenance":"高倉健→遺族から坂城町へ寄贈→鉄の展示館","story":"俳優・高倉健の愛蔵品。宮入行平一門との親交が縁で坂城町へ寄贈。","media_appearance":"なし","image_source_url":"不明","image_license":"不明","confidence":"推定"},
  {"id":"sword_09","name":"刀 銘九州日向住国広作（山姥切）","reading":"やまんばぎり","designation":"重要文化財","category":"打刀","dimensions":"刃長70.6cm 反り2.8cm","era":"安土桃山時代・天正18年(1590)","smith":"堀川国広","school":"堀川派","current_holder":"足利市民文化財団","location":"栃木県足利市","provenance":"長尾顕長→井伊家→個人→足利市民文化財団","story":"長義の刀を国広に写させた作で、国広天正打の最高傑作。山姥退治の伝説を持つ。","media_appearance":"刀剣乱舞","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_10","name":"太刀 銘長光（号大般若長光）","reading":"だいはんにゃながみつ","designation":"国宝","category":"太刀","dimensions":"刃長73.6cm 反り2.9cm","era":"鎌倉時代","smith":"長船長光","school":"備前長船派","current_holder":"東京国立博物館","location":"東京都台東区","provenance":"足利義輝→三好長慶→織田信長→徳川家康→奥平信昌→東京国立博物館","story":"代価が破格の600貫と極められ、全600巻の大般若経に掛けて命名された名物。","media_appearance":"刀剣乱舞","image_source_url":"https://colbase.nich.go.jp/collection_items/tnm/F-19789?locale=ja","image_license":"出典明記で商用可・加工可","confidence":"事実"},
  {"id":"sword_11","name":"太刀 額銘吉光（名物一期一振）","reading":"いちごひとふり","designation":"御物","category":"太刀","dimensions":"刃長68.78cm 反り2.58cm","era":"鎌倉時代","smith":"粟田口吉光","school":"粟田口派","current_holder":"宮内庁侍従職","location":"東京都千代田区","provenance":"毛利家→豊臣秀吉→徳川将軍家→尾張徳川家→孝明天皇→宮内庁","story":"短刀の名手・吉光が生涯で唯一打った太刀。秀吉が磨上げ額銘とした。","media_appearance":"刀剣乱舞","image_source_url":"不明","image_license":"不明","confidence":"事実"},
  {"id":"sword_12","name":"短刀 銘吉光（名物厚藤四郎）","reading":"あつとうしろう","designation":"国宝","category":"短刀","dimensions":"刃長21.82cm 内反り","era":"鎌倉時代","smith":"粟田口吉光","school":"粟田口派","current_holder":"東京国立博物館","location":"東京都台東区","provenance":"足利将軍家→豊臣秀吉→毛利秀元→徳川家綱→一橋家→東京国立博物館","story":"寸法は短いが重ねが約1.2cmと異常に分厚い鎧通しの造りに由来。","media_appearance":"刀剣乱舞","image_source_url":"https://colbase.nich.go.jp/collection_items/tnm/F-19547?locale=ja","image_license":"出典明記で商用可・加工可","confidence":"事実"}
];

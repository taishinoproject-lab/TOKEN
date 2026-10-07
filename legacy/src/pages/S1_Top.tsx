import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { swords } from '../data/swords';
import { events, getEventStatus } from '../data/events';
import { swordEventLinks } from '../data/links';
import { searchSwords } from '../utils/search';
import ColbaseImage from '../components/ui/ColbaseImage';

export default function S1_Top() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const results = searchSwords(query);
  
  // Find ongoing swords
  const ongoingLinks = swordEventLinks.filter(link => {
    const ev = events.find(e => e.id === link.event_id);
    return ev && getEventStatus(ev) === 'ongoing';
  });
  
  const rawOngoingSwords = ongoingLinks.map(link => {
    const sword = swords.find(s => s.id === link.sword_id);
    const ev = events.find(e => e.id === link.event_id);
    return { sword, ev };
  }).filter(item => item.sword && item.ev) as { sword: typeof swords[0], ev: typeof events[0] }[];

  // 1. Group by sword name/character to merge duplicates
  const groupedSwordsMap = new Map<string, { swords: typeof swords[0][], evs: typeof events[0][] }>();
  
  for (const item of rawOngoingSwords) {
    let groupKey = item.sword.name;
    // Normalize names to merge the same character/sword
    if (groupKey.includes('鬼切丸')) groupKey = '鬼切丸';
    else if (groupKey.includes('堀川国広') || groupKey.includes('信濃守国広造') || groupKey.includes('國廣')) groupKey = '堀川国広';
    else if (groupKey.includes('水心子正秀')) groupKey = '水心子正秀';
    else if (groupKey.includes('大包平')) groupKey = '大包平';
    else if (groupKey.includes('三日月宗近')) groupKey = '三日月宗近';
    else if (groupKey.includes('大典太')) groupKey = '大典太光世';

    if (!groupedSwordsMap.has(groupKey)) {
      groupedSwordsMap.set(groupKey, { swords: [], evs: [] });
    }
    groupedSwordsMap.get(groupKey)!.swords.push(item.sword);
    
    // Avoid duplicate events
    if (!groupedSwordsMap.get(groupKey)!.evs.find(e => e.id === item.ev.id)) {
      groupedSwordsMap.get(groupKey)!.evs.push(item.ev);
    }
  }

  // 2. Select the best sword to represent the group
  const ongoingSwords = Array.from(groupedSwordsMap.values()).map(group => {
    // Prioritize high-resolution images (those with specific URLs or not '不明')
    const bestSword = group.swords.sort((a, b) => {
      const isGoodA = a.image_source_url && a.image_source_url !== '不明' && a.image_source_url !== '';
      const isGoodB = b.image_source_url && b.image_source_url !== '不明' && b.image_source_url !== '';
      if (isGoodA && !isGoodB) return -1;
      if (!isGoodA && isGoodB) return 1;
      return 0; // fallback
    })[0];
    
    return { sword: bestSword, evs: group.evs };
  });

  // 3. Sort: Put prioritized swords first in strict order
  const PRIORITY_KEYWORDS = ['鬼切丸', '堀川国広', '水心子正秀', '大包平', '三日月宗近'];
  
  const getPriorityIndex = (sword: typeof swords[0]) => {
    const index = PRIORITY_KEYWORDS.findIndex(k => sword.name.includes(k) || sword.smith.includes(k));
    return index !== -1 ? index : PRIORITY_KEYWORDS.length;
  };

  ongoingSwords.sort((a, b) => {
    const priorityA = getPriorityIndex(a.sword);
    const priorityB = getPriorityIndex(b.sword);
    return priorityA - priorityB;
  });

  // Find upcoming/ongoing events
  const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming' || getEventStatus(e) === 'ongoing');

  return (
    <div className="flex flex-col gap-12 pt-4">
      {/* Hero & Search */}
      <section className="bg-gradient-to-br from-brand-text via-[#2a2725] to-brand-primary text-brand-bg -mt-8 -mx-4 sm:-mx-8 p-8 sm:p-16 pb-20 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
        {/* Abstract background effect */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <h1 className="font-serif text-3xl sm:text-5xl mb-10 relative z-10 font-bold tracking-widest drop-shadow-lg">推しの刀に、会いに行こう。</h1>
        
        <div className="relative w-full max-w-xl z-20">
          <div className="flex items-center bg-brand-bg text-brand-text rounded-md px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-brand-gold/30 focus-within:border-brand-gold transition-colors">
            <span className="text-xl mr-3 opacity-60">🔍</span>
            <input 
              type="text" 
              placeholder="刀の名前・刀工の銘で検索（例：鬼切丸／安綱）"
              className="flex-1 bg-transparent outline-none font-sans text-lg placeholder:text-brand-text/40"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          
          {query && results.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-brand-bg text-brand-text rounded-md shadow-2xl overflow-hidden z-30 text-left border border-brand-primary/20 max-h-80 overflow-y-auto">
              {results.slice(0, 8).map(sword => (
                <div 
                  key={sword.id} 
                  className="px-5 py-4 hover:bg-brand-primary/10 cursor-pointer border-b border-black/5 last:border-0 transition-colors"
                  onClick={() => navigate(`/sword/${sword.id}`)}
                >
                  <div className="font-serif font-bold text-lg">{sword.name}</div>
                  <div className="text-sm opacity-70 mt-1">刀工: {sword.smith} ({sword.school})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* いま会える刀 */}
      <section className="px-4 sm:px-0">
        <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3 border-b border-brand-primary/20 pb-3">
          <span className="text-brand-accent text-2xl drop-shadow">⚔</span> いま会える刀
        </h2>
        <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 -mx-2 snap-x hide-scrollbar">
          {ongoingSwords.map(({ sword, evs }) => (
            <Link to={`/sword/${sword.id}`} key={sword.id} className="min-w-[260px] w-[260px] bg-white rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.08)] overflow-hidden snap-start hover:-translate-y-1 hover:shadow-xl transition-all border border-brand-text/5 group">
              <div className="h-44 bg-brand-text/5 relative overflow-hidden">
                <ColbaseImage id={sword.id} keyword={sword.name} alt={sword.name} className="opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute top-3 left-3 bg-status-ongoing text-white text-xs font-bold px-3 py-1.5 shadow-md">
                  🟢 {evs.map(e => e.venue).join('・')}で展示中
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-lg leading-tight mb-3 line-clamp-2">{sword.name}</h3>
                <p className="text-xs text-brand-text/70 line-clamp-1">{evs.map(e => e.title).join(' / ')}</p>
                <p className="text-xs font-bold text-brand-primary mt-1">〜{evs[0].end_date.replace(/-/g, '/')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 開催予定の展覧会 */}
      <section className="px-4 sm:px-0">
        <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3 border-b border-brand-primary/20 pb-3">
          <span className="text-brand-primary text-2xl drop-shadow">📅</span> 開催予定の展覧会
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {upcomingEvents.map(ev => {
            const isPdf = ev.flyer_image_url?.endsWith('.pdf');
            return (
            <Link to={`/event/${ev.id}`} key={ev.id} className="group relative aspect-[1/1.4] bg-brand-text/5 rounded-sm shadow-md overflow-hidden border border-black/10 hover:shadow-lg transition-shadow">
              {ev.flyer_image_url && !isPdf ? (
                <img src={ev.flyer_image_url ?? undefined} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-brand-bg border-4 border-double border-brand-text/10">
                   <div className="text-4xl opacity-20 mb-2">📜</div>
                   <div className="text-center font-serif text-sm opacity-60">チラシ準備中</div>
                </div>
              )}
              <div className={`absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-brand-text/90 via-brand-text/40 to-transparent ${ev.flyer_image_url && !isPdf ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
                <h3 className="text-white font-bold text-sm leading-snug drop-shadow-md">{ev.title}</h3>
                <p className="text-brand-gold text-xs mt-2 drop-shadow-md">{ev.venue}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </section>
      
      {/* 隠しスタイル: スクロールバー非表示 */}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}


import { useParams, useNavigate, Link } from 'react-router-dom';
import { events, getEventStatus } from '../data/events';
import { swords } from '../data/swords';
import { useWantToGo } from '../hooks/useWantToGo';
import { venues } from '../data/venues';

const dummyComments = [
  { id: 1, author: "刀剣ファンA", text: "刃文がとても美しかったです。単眼鏡必須です！", date: "2026/05/01" },
  { id: 2, author: "歴史好きB", text: "展示ケースの照明が見やすくて最高でした。また行きたいです。", date: "2026/05/03" },
  { id: 3, author: "名無し", text: "休日はかなり混雑していました。平日がおすすめ。", date: "2026/05/04" }
];

export default function S3_Event() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ev = events.find(e => e.id === id);
  const { isWanted, toggleWant, count } = useWantToGo(id || '', ev?.want_count_seed || 0);

  if (!ev) return <div className="p-8 text-center">イベントが見つかりません</div>;

  const status = getEventStatus(ev);
  const statusLabel = status === 'ongoing' ? '🟢 開催中' : status === 'upcoming' ? '🔜 開催予定' : '終了';
  
  const venueCoords = venues[ev.venue];
  
  // Try to map highlight_swords text to actual sword objects
  const exhibitSwords = ev.highlight_swords.map(hs => {
    // Attempt simple matching
    const matchedSword = swords.find(s => hs.includes(s.name) || s.name.includes(hs) || (s.reading && hs.includes(s.reading)));
    return { nameText: hs, sword: matchedSword };
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <button onClick={() => navigate(-1)} className="text-brand-primary font-bold self-start px-2 py-1 flex items-center gap-1 hover:text-brand-accent transition-colors">
        ← 戻る
      </button>

      {/* Main Info */}
      <section className="bg-white p-5 rounded-sm shadow-md border border-brand-primary/10 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/5 max-w-sm mx-auto bg-brand-bg relative overflow-hidden rounded border border-black/5 shadow-inner">
          {ev.flyer_image_url && !ev.flyer_image_url.endsWith('.pdf') ? (
            <img src={`/src/assets/flyers/${ev.id}.jpg`} alt={ev.title} className="w-full h-auto" />
          ) : (
            <div className="w-full aspect-[1/1.4] flex flex-col items-center justify-center p-8 bg-brand-bg border-4 border-double border-brand-text/10">
              <div className="text-5xl opacity-20 mb-4">📜</div>
              <div className="text-center font-serif text-lg opacity-60 font-bold">{ev.title}</div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4 leading-snug">{ev.title}</h1>
          
          <div className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className={status === 'ongoing' ? 'text-status-ongoing' : status === 'upcoming' ? 'text-status-upcoming' : 'text-status-ended'}>
              {statusLabel}
            </span>
            <span className="text-sm font-normal text-brand-text/80">{ev.start_date.replace(/-/g, '/')} 〜 {ev.end_date.replace(/-/g, '/')}</span>
          </div>
          
          <div className="text-sm space-y-2 mb-6">
            <p className="flex gap-2 items-start"><span className="opacity-50">📍</span> <span>{ev.venue} <br/><span className="text-xs opacity-70">({ev.prefecture}{ev.city})</span></span></p>
            <p className="flex gap-2 items-center"><span className="opacity-50">💴</span> <span>{ev.admission}</span></p>
            <p className="flex gap-2 items-center"><span className="opacity-50">🌐</span> <a href={ev.official_url} target="_blank" rel="noreferrer" className="text-brand-primary underline hover:text-brand-accent">公式サイト ↗</a></p>
          </div>

          <button 
            onClick={toggleWant}
            className={`mt-auto w-full md:w-auto self-start px-8 py-4 rounded-full font-bold shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${isWanted ? 'bg-brand-accent text-white' : 'bg-brand-bg border-2 border-brand-accent text-brand-accent hover:bg-brand-accent/10'}`}
          >
            <span className="text-2xl">🚩</span>
            行きたい
            <span className={`text-xl font-mono ml-2 ${isWanted ? 'text-white' : 'text-brand-text'}`}>{count}</span>
          </button>
        </div>
      </section>

      {/* Map */}
      <section className="bg-white p-5 rounded-sm shadow-sm border border-black/5 mt-2">
        <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 border-b border-black/10 pb-2">
          <span>🗾</span> 開催地
        </h2>
        <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] bg-brand-bg rounded overflow-hidden shadow-inner border border-black/10">
          <img src="/src/assets/map_bg.png" className="w-full h-full object-cover opacity-60 mix-blend-multiply" alt="Map" />
          {venueCoords && (
            <div 
              className="absolute flex flex-col items-center"
              style={{ left: `${venueCoords.x}%`, top: `${venueCoords.y}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="text-4xl drop-shadow-md animate-bounce" style={{ color: 'var(--color-brand-accent)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>📍</div>
              <div className="bg-brand-bg px-3 py-1 rounded text-sm font-bold border-2 border-brand-accent text-brand-text shadow-lg mt-1 whitespace-nowrap">
                {ev.venue.split(' ')[0]}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Exhibit Swords */}
      <section className="bg-white p-5 rounded-sm shadow-sm border border-black/5 mt-2">
        <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 border-b border-black/10 pb-2">
          <span>⚔</span> 出品刀剣
        </h2>
        <ul className="space-y-2">
          {exhibitSwords.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-brand-gold">▪</span>
              {item.sword ? (
                <Link to={`/sword/${item.sword.id}`} className="text-brand-primary underline font-bold hover:text-brand-accent">
                  {item.nameText}
                </Link>
              ) : (
                <span>{item.nameText}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Comments */}
      <section className="bg-white p-5 rounded-sm shadow-sm border border-black/5 mt-2">
        <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 border-b border-black/10 pb-2">
          <span>💬</span> コメント ({dummyComments.length}件)
        </h2>
        
        <div className="space-y-4 mb-8">
          {dummyComments.map(c => (
            <div key={c.id} className="bg-brand-bg p-4 rounded border border-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm">{c.author}</span>
                <span className="text-xs opacity-60">{c.date}</span>
              </div>
              <p className="text-sm">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-bg/50 p-4 rounded border border-brand-primary/20">
          <textarea 
            className="w-full bg-white border border-black/10 rounded p-3 text-sm focus:outline-none focus:border-brand-primary mb-3 min-h-[80px]"
            placeholder="コメントを書く…"
          ></textarea>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold opacity-80">公開範囲：</span>
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="scope" defaultChecked /> 公開</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="scope" /> フォロワーのみ</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="scope" /> 非公開</label>
            </div>
            <button className="bg-brand-primary text-white px-6 py-2 rounded shadow hover:bg-brand-primary/80 transition-colors font-bold w-full sm:w-auto">
              投稿
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

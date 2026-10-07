import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { swords } from '../data/swords';
import { events, getEventStatus } from '../data/events';
import { swordEventLinks } from '../data/links';
import { useFollow } from '../hooks/useFollow';
import ColbaseImage from '../components/ui/ColbaseImage';

export default function S2_Sword() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sword = swords.find(s => s.id === id);
  const { isFollowing, toggleFollow } = useFollow(id || '');
  const [showToast, setShowToast] = useState(false);

  if (!sword) return <div className="p-8 text-center">刀が見つかりません</div>;

  const handleFollow = () => {
    toggleFollow();
    if (!isFollowing) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Find events for this sword
  const linkedEventIds = swordEventLinks.filter(l => l.sword_id === id).map(l => l.event_id);
  const swordEvents = events.filter(e => linkedEventIds.includes(e.id));
  
  const ongoingEvent = swordEvents.find(e => getEventStatus(e) === 'ongoing');
  const upcomingEvent = swordEvents.find(e => getEventStatus(e) === 'upcoming');

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative pb-8">
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-6 py-3 rounded shadow-xl z-50 text-sm whitespace-nowrap animate-slide-up">
          フォローしました。<br/>近くで展示が決まるとお知らせします。
        </div>
      )}

      <button onClick={() => navigate(-1)} className="text-brand-primary font-bold self-start px-2 py-1 flex items-center gap-1 hover:text-brand-accent transition-colors">
        ← 戻る
      </button>

      {/* Basic Info */}
      <section className="bg-white p-5 rounded-sm shadow-md border border-brand-primary/10 flex flex-col md:flex-row gap-6 relative">
        <div className="w-full md:w-1/3 aspect-square bg-brand-bg relative overflow-hidden rounded border border-black/5">
          <ColbaseImage id={sword.id} keyword={sword.name} alt={sword.name} />
          <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white/80 text-[10px] p-1 text-center">
            {sword.image_source_url !== '不明'
              ? `画像出典：${sword.image_source_url.includes('colbase.nich.go.jp') ? 'ColBase' : '真田宝物館'}`
              : '画像提供：ー'}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h1 className="font-serif text-2xl font-bold mb-2">{sword.name}</h1>
          <div className="text-xs text-brand-text/60 mb-4 tracking-widest">{sword.reading}</div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {sword.designation && sword.designation !== "未指定" && <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded font-bold">{sword.designation}</span>}
            <span className="bg-brand-primary text-white text-xs px-2 py-1 rounded">{sword.category}</span>
            <span className="bg-brand-bg border border-brand-primary/30 text-brand-text text-xs px-2 py-1 rounded">{sword.era}</span>
          </div>
          
          <div className="text-sm space-y-1 mb-4 border-l-2 border-brand-accent pl-3 py-1">
            <p>寸法：{sword.dimensions}</p>
            <p>刀工：{sword.smith} ({sword.school})</p>
          </div>
          
          <p className="text-sm leading-relaxed text-brand-text/90 mb-6 flex-1">
            {sword.story}
          </p>

          <button 
            onClick={handleFollow}
            className={`self-start px-6 py-2 rounded-full font-bold shadow transition-all flex items-center gap-2 ${isFollowing ? 'bg-brand-primary text-white' : 'bg-brand-bg border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10'}`}
          >
            {isFollowing ? '♥ フォロー中' : '♡ フォローする'}
          </button>
        </div>
      </section>

      {/* Exhibition Status (Killer Feature) */}
      <section className="mt-4">
        <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-brand-accent">●</span> 展示ステータス
        </h2>
        
        {ongoingEvent ? (
          <div className="bg-status-ongoing text-white rounded-md shadow-lg border border-black/10 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIwLjUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
            <div className="p-5 relative z-10">
              <div className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="animate-pulse">🟢</span> いま会えます
              </div>
              <h3 className="font-serif text-xl font-bold my-3">{ongoingEvent.title}</h3>
              <p className="opacity-90">{ongoingEvent.venue}</p>
              <p className="opacity-90 text-sm mt-1 mb-4">〜{ongoingEvent.end_date.replace(/-/g, '/')}</p>
              
              {ongoingEvent.flyer_image_url && !ongoingEvent.flyer_image_url.endsWith('.pdf') && (
                <Link to={`/event/${ongoingEvent.id}`} className="block w-40 sm:w-48 shadow-lg hover:scale-105 transition-transform border border-white/20 rounded">
                  <img src={ongoingEvent.flyer_image_url ?? undefined} alt="チラシ" className="w-full h-auto object-cover rounded" />
                </Link>
              )}
              {ongoingEvent.flyer_image_url?.endsWith('.pdf') && (
                <Link to={`/event/${ongoingEvent.id}`} className="inline-block bg-white text-brand-text px-4 py-2 rounded shadow font-bold text-sm hover:bg-brand-bg transition-colors">
                  展覧会の詳細を見る →
                </Link>
              )}
            </div>
          </div>
        ) : upcomingEvent ? (
          <div className="bg-status-upcoming text-white rounded-md shadow-lg border border-black/10 p-5 relative overflow-hidden">
            <div className="font-bold text-lg mb-1 flex items-center gap-2">
              <span>🔜</span> 開催予定
            </div>
            <h3 className="font-serif text-lg font-bold my-2">{upcomingEvent.title}に出品予定</h3>
            <p className="opacity-90 text-sm">会期: {upcomingEvent.start_date.replace(/-/g, '/')} 〜</p>
            <Link to={`/event/${upcomingEvent.id}`} className="inline-block mt-4 bg-white text-brand-text px-4 py-2 rounded shadow font-bold text-sm hover:bg-brand-bg transition-colors">
              展覧会の詳細を見る →
            </Link>
          </div>
        ) : (
          <div className="bg-brand-bg border-2 border-brand-primary/20 rounded-md p-5 text-brand-text text-center">
            <div className="text-3xl mb-2 opacity-50">🏛</div>
            <div className="font-bold text-lg mb-1">{sword.current_holder} 所蔵</div>
            <p className="text-sm opacity-70">（総合文化展・展示替えあり）</p>
          </div>
        )}
      </section>

      {/* Provenance */}
      <section className="bg-white p-5 rounded-sm shadow-sm border border-black/5 mt-4">
        <h2 className="font-serif text-lg font-bold mb-3 border-b border-black/10 pb-2">伝来</h2>
        <p className="text-sm leading-relaxed text-brand-text/80">{sword.provenance}</p>
      </section>
      
      <style>{`
        @keyframes slide-up {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

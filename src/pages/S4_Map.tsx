import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVisits } from '../hooks/useVisits';
import { events } from '../data/events';
import { venues } from '../data/venues';
import { DEMO_TODAY, USER_INFO } from '../data/constants';

export default function S4_Map() {
  const { visits, addVisit } = useVisits();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  
  // Modal state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [date, setDate] = useState(DEMO_TODAY);
  const [photoIdx, setPhotoIdx] = useState(1);
  const [text, setText] = useState('');
  const [scope, setScope] = useState('公開');
  const [searchQuery, setSearchQuery] = useState('');

  // Map state
  const [activePin, setActivePin] = useState<string | null>(null);
  
  // Get wants
  const wants = JSON.parse(localStorage.getItem('token_wants') || '[]');
  const wantedEvents = events.filter(e => wants.includes(e.id));
  const visitedEventIds = visits.map(v => v.eventId);

  const handleOpenModal = () => {
    setStep(1);
    setSelectedEventId('');
    setText('');
    setShowModal(true);
  };

  const handleRecord = () => {
    addVisit({
      id: `v${Date.now()}`,
      eventId: selectedEventId,
      date,
      photoIdx,
      text,
      scope
    });
    setShowModal(false);
    setActivePin(selectedEventId); // Auto-open the newly added pin
  };

  const searchedEvents = events.filter(e => e.title.includes(searchQuery) || e.venue.includes(searchQuery));

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative pb-8">
      
      <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm border border-black/5">
        <h1 className="font-serif text-xl font-bold flex items-center gap-2">
          <span className="text-brand-accent">📓</span> {USER_INFO.name}さんの訪剣帖
        </h1>
        <button 
          onClick={handleOpenModal}
          className="bg-brand-primary text-white px-4 py-2 rounded-full shadow text-sm font-bold hover:bg-brand-primary/80 transition-colors"
        >
          ＋ 訪問記録を追加
        </button>
      </div>

      {/* Map */}
      <section className="bg-white p-2 rounded shadow-md border border-black/10 relative">
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/2] md:aspect-[2/1] bg-brand-bg overflow-hidden rounded shadow-inner">
          <img src="/src/assets/map_bg.png" className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="古地図" />
          
          {/* Want Pins (Light color) */}
          {wantedEvents.map(ev => {
            if (visitedEventIds.includes(ev.id)) return null; // Don't show want pin if visited
            const coords = venues[ev.venue];
            if (!coords) return null;
            return (
              <div 
                key={`want-${ev.id}`}
                className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -100%)' }}
                title={ev.title}
              >
                <div className="text-3xl drop-shadow opacity-50">📍</div>
                <div className="bg-white/80 px-1 rounded text-[10px] font-bold text-brand-text/50 shadow mt-0.5 whitespace-nowrap">
                  {ev.city}
                </div>
              </div>
            );
          })}

          {/* Visited Pins (Accent color) */}
          {visits.map(v => {
            const ev = events.find(e => e.id === v.eventId);
            if (!ev) return null;
            const coords = venues[ev.venue];
            if (!coords) return null;
            const isActive = activePin === ev.id;
            
            return (
              <div 
                key={`visit-${v.id}`}
                className={`absolute flex flex-col items-center cursor-pointer transition-all z-10 ${isActive ? 'z-20 scale-110' : 'hover:scale-110'}`}
                style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -100%)' }}
                onClick={() => setActivePin(isActive ? null : ev.id)}
              >
                <div className="text-4xl drop-shadow-md animate-bounce-once" style={{ color: 'var(--color-brand-accent)' }}>📍</div>
                <div className="bg-brand-accent px-1.5 rounded-sm text-xs font-bold text-white shadow-md mt-0.5 whitespace-nowrap border border-white/50">
                  {ev.city}
                </div>
                
                {/* Popover Bubble */}
                {isActive && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-56 bg-white rounded shadow-xl border border-brand-primary/20 p-2 cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                    <img src={`/src/assets/visit_presets/preset_${v.photoIdx}.png`} alt="記録写真" className="w-full h-24 object-cover rounded mb-2" />
                    <p className="text-xs text-brand-text/80 mb-2 line-clamp-3">{v.text}</p>
                    <Link to={`/event/${ev.id}`} className="block text-center text-xs bg-brand-bg border border-brand-primary/20 text-brand-primary py-1 rounded hover:bg-brand-primary hover:text-white transition-colors">
                      展覧会ページへ
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* History List */}
      <section className="bg-white p-5 rounded shadow-sm border border-black/5 mt-4">
        <h2 className="font-serif text-lg font-bold mb-4 border-b border-black/10 pb-2">訪問履歴</h2>
        <div className="space-y-3">
          {visits.map(v => {
            const ev = events.find(e => e.id === v.eventId);
            return (
              <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-brand-bg/50 p-3 rounded border border-black/5 gap-2 hover:bg-brand-bg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-brand-primary shrink-0">{v.date}</div>
                  <div className="font-serif text-sm line-clamp-1">{ev?.title} ＠ {ev?.venue.split(' ')[0]}</div>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end text-xs text-brand-text/70 shrink-0">
                  <div className="truncate max-w-[120px] sm:max-w-[180px] italic">「{v.text}」</div>
                  <div className="bg-white px-2 py-0.5 rounded shadow-sm border border-black/10">🌐 {v.scope}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal M1 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-brand-primary text-white px-5 py-3 font-serif font-bold flex justify-between items-center shrink-0">
              {step === 1 ? 'どのイベントに行きましたか？' : '訪問記録の入力'}
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-xl leading-none">×</button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <input 
                      type="text" 
                      placeholder="🔍 イベント名で検索"
                      className="w-full border border-black/20 rounded p-2 text-sm focus:border-brand-primary outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {searchQuery ? (
                    <div className="space-y-2">
                      <div className="text-xs text-brand-text/60 font-bold mb-2">検索結果</div>
                      {searchedEvents.map(ev => (
                        <div 
                          key={ev.id} 
                          className={`p-3 rounded border cursor-pointer text-sm ${selectedEventId === ev.id ? 'border-brand-accent bg-brand-accent/5 font-bold' : 'border-black/10 hover:bg-brand-bg'}`}
                          onClick={() => setSelectedEventId(ev.id)}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-brand-text/60 font-bold mb-2 flex items-center gap-2">
                        <span className="flex-1 h-px bg-black/10"></span>
                        行きたいリストから
                        <span className="flex-1 h-px bg-black/10"></span>
                      </div>
                      {wantedEvents.length > 0 ? wantedEvents.map(ev => (
                        <div 
                          key={ev.id} 
                          className={`p-3 rounded border cursor-pointer text-sm flex justify-between items-center ${selectedEventId === ev.id ? 'border-brand-accent bg-brand-accent/5 font-bold text-brand-accent' : 'border-black/10 hover:bg-brand-bg'}`}
                          onClick={() => setSelectedEventId(ev.id)}
                        >
                          {ev.title} ＠ {ev.venue.split(' ')[0]}
                          {selectedEventId === ev.id && <span>✓</span>}
                        </div>
                      )) : (
                        <div className="text-center text-sm opacity-50 py-4">行きたいリストに登録されたイベントはありません</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="font-serif font-bold text-lg border-b border-black/10 pb-2 mb-4">
                    {events.find(e => e.id === selectedEventId)?.title}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-brand-text/70 mb-1">日付</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-black/20 rounded p-2 text-sm outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-brand-text/70 mb-1">写真</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <img 
                          key={i}
                          src={`/src/assets/visit_presets/preset_${i}.png`} 
                          alt={`Preset ${i}`}
                          className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${photoIdx === i ? 'border-brand-accent shadow-md scale-105' : 'border-transparent hover:border-black/20'}`}
                          onClick={() => setPhotoIdx(i)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-brand-text/70 mb-1">感想</label>
                    <textarea 
                      className="w-full border border-black/20 rounded p-2 text-sm outline-none min-h-[80px]"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="例：初めて間近で見られて感動しました！"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-brand-text/70 mb-1">公開範囲</label>
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="m_scope" checked={scope === '公開'} onChange={() => setScope('公開')} /> 公開</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="m_scope" checked={scope === '非公開'} onChange={() => setScope('非公開')} /> 非公開</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-brand-bg border-t border-black/10 p-4 flex justify-between shrink-0">
              {step === 1 ? (
                <>
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-brand-text/70 font-bold hover:text-brand-text">キャンセル</button>
                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedEventId}
                    className="px-6 py-2 bg-brand-primary text-white rounded text-sm font-bold disabled:opacity-50 transition-colors"
                  >
                    次へ →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-brand-text/70 font-bold hover:text-brand-text">← 戻る</button>
                  <button 
                    onClick={handleRecord} 
                    className="px-6 py-2 bg-brand-accent text-white rounded text-sm font-bold shadow-md hover:bg-[#a1322f] transition-colors"
                  >
                    記録する →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

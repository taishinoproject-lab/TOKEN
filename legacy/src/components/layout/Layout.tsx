import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ follows: 0, wants: 0 });
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);

  useEffect(() => {
    const updateCounts = () => {
      const follows = JSON.parse(localStorage.getItem('token_follows') || '[]');
      const wants = JSON.parse(localStorage.getItem('token_wants') || '[]');
      setCounts({ follows: follows.length, wants: wants.length });
    };

    updateCounts(); // Initial load

    const handleStorageChange = () => updateCounts();
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToast({ message: customEvent.detail, id: Date.now() });
      setTimeout(() => setToast(null), 3000);
    };

    window.addEventListener('token-storage-change', handleStorageChange);
    window.addEventListener('token-toast', handleToast);

    return () => {
      window.removeEventListener('token-storage-change', handleStorageChange);
      window.removeEventListener('token-toast', handleToast);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-brand-primary text-brand-bg px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src="/logo.jpg" alt="訪剣 Logo" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-serif text-xl tracking-widest font-bold">訪剣 −TOKEN−</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/map')} className="flex items-center gap-1 hover:text-brand-gold transition-colors text-sm sm:text-base">
            <span className="text-xl">🗾</span> 刀地図
          </button>
          <div className="relative cursor-pointer hover:text-brand-gold transition-colors">
            <span className="text-xl">♡</span>
            {counts.follows > 0 && (
              <span key={`f-${counts.follows}`} className="absolute -top-1 -right-2 bg-brand-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-pulse-once">{counts.follows}</span>
            )}
          </div>
          <div className="relative cursor-pointer hover:text-brand-gold transition-colors">
            <span className="text-xl">🔔</span>
            {counts.wants > 0 && (
              <span key={`w-${counts.wants}`} className="absolute -top-1 -right-2 bg-brand-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-pulse-once">{counts.wants}</span>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full mx-auto pb-12">
        {children}
      </main>

      <footer className="bg-brand-primary text-brand-bg/80 text-xs py-6 px-4 text-center mt-8 border-t-2 border-brand-accent">
        <p>本アプリは学習・発表用デモです。</p>
        <p>画像出典：国立文化財機構所蔵品統合検索システム（ColBase）および各所蔵館・主催者に帰属します。</p>
        <p>会期等は変更される場合があります</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div key={toast.id} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-text/90 backdrop-blur-sm text-white px-6 py-3 rounded shadow-xl z-[100] animate-toast flex items-center gap-3 border border-white/10">
          <span className="text-brand-gold text-lg">✨</span>
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

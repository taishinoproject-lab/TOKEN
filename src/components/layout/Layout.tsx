import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-brand-primary text-brand-bg px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <span className="font-serif text-xl tracking-widest font-bold">訪剣 −TOKEN−</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/map')} className="flex items-center gap-1 hover:text-brand-gold transition-colors">
            <span className="text-xl">🗾</span> 刀地図
          </button>
          <div className="relative cursor-pointer">
            <span className="text-xl">♡</span>
            <span className="absolute -top-1 -right-2 bg-brand-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </div>
          <div className="relative cursor-pointer">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-2 bg-brand-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full mx-auto pb-12">
        {children}
      </main>

      <footer className="bg-brand-primary text-brand-bg/80 text-xs py-6 px-4 text-center mt-8">
        <p>本アプリは学習・発表用デモです。</p>
        <p>画像出典：国立文化財機構所蔵品統合検索システム（ColBase）および各所蔵館・主催者に帰属します。</p>
        <p>会期等は変更される場合があります</p>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';

export const useWantToGo = (eventId: string, initialCount: number) => {
  const [isWanted, setIsWanted] = useState(false);
  
  useEffect(() => {
    const wants = JSON.parse(localStorage.getItem('token_wants') || '[]');
    setIsWanted(wants.includes(eventId));
  }, [eventId]);

  const toggleWant = () => {
    const wants = JSON.parse(localStorage.getItem('token_wants') || '[]');
    if (isWanted) {
      const newWants = wants.filter((id: string) => id !== eventId);
      localStorage.setItem('token_wants', JSON.stringify(newWants));
      setIsWanted(false);
      window.dispatchEvent(new Event('token-storage-change'));
      window.dispatchEvent(new CustomEvent('token-toast', { detail: '「行きたい」を取り消しました' }));
    } else {
      wants.push(eventId);
      localStorage.setItem('token_wants', JSON.stringify(wants));
      setIsWanted(true);
      window.dispatchEvent(new Event('token-storage-change'));
      window.dispatchEvent(new CustomEvent('token-toast', { detail: '展覧会を「行きたい」に登録しました！' }));
    }
  };

  const count = initialCount + (isWanted ? 1 : 0);

  return { isWanted, toggleWant, count };
};

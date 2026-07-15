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
    } else {
      wants.push(eventId);
      localStorage.setItem('token_wants', JSON.stringify(wants));
      setIsWanted(true);
    }
  };

  const count = initialCount + (isWanted ? 1 : 0);

  return { isWanted, toggleWant, count };
};

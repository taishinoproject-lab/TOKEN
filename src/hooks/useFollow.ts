import { useState, useEffect } from 'react';

export const useFollow = (swordId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const follows = JSON.parse(localStorage.getItem('token_follows') || '[]');
    setIsFollowing(follows.includes(swordId));
  }, [swordId]);

  const toggleFollow = () => {
    const follows = JSON.parse(localStorage.getItem('token_follows') || '[]');
    if (isFollowing) {
      const newFollows = follows.filter((id: string) => id !== swordId);
      localStorage.setItem('token_follows', JSON.stringify(newFollows));
      setIsFollowing(false);
      window.dispatchEvent(new Event('token-storage-change'));
      window.dispatchEvent(new CustomEvent('token-toast', { detail: 'フォローを解除しました' }));
    } else {
      follows.push(swordId);
      localStorage.setItem('token_follows', JSON.stringify(follows));
      setIsFollowing(true);
      window.dispatchEvent(new Event('token-storage-change'));
      window.dispatchEvent(new CustomEvent('token-toast', { detail: '刀剣をフォローしました！' }));
    }
  };

  return { isFollowing, toggleFollow };
};

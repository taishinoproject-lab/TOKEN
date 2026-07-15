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
    } else {
      follows.push(swordId);
      localStorage.setItem('token_follows', JSON.stringify(follows));
      setIsFollowing(true);
    }
  };

  return { isFollowing, toggleFollow };
};

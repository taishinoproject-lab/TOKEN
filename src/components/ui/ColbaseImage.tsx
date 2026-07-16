import { useState, useEffect } from 'react';

interface ColbaseImageProps {
  id?: string;
  keyword?: string;
  url?: string;
  alt?: string;
  className?: string;
}

// ローカルにダウンロード済みの高画質画像（src/assets/swords/{id}.jpg）を優先的に使う。
// ビルド時に静的解決されるよう import.meta.glob で一覧化しておく。
const localSwordImages = import.meta.glob('../../assets/swords/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const getLocalImage = (id?: string): string | null => {
  if (!id) return null;
  const entry = Object.entries(localSwordImages).find(([path]) =>
    path.includes(`/${id}.`)
  );
  return entry ? entry[1] : null;
};

export default function ColbaseImage({ id, keyword, alt, className }: ColbaseImageProps) {
  const localSrc = getLocalImage(id);
  const [imgUrl, setImgUrl] = useState<string | null>(localSrc);

  useEffect(() => {
    // ローカル画像があればそれを使用し、API検索はスキップする
    if (localSrc) {
      setImgUrl(localSrc);
      return;
    }

    let isMounted = true;

    const fetchFromApi = async () => {
      try {
        // Japan Search API is the official public API providing ColBase metadata.
        // It provides robust cross-origin search with JSON responses.
        let searchQuery = '';
        if (keyword) {
          // Clean up the keyword to increase hit rate for Japan Search
          searchQuery = keyword.split('（')[0]
            .replace('大太刀', '')
            .replace('太刀', '')
            .replace('短刀', '')
            .replace('脇指', '')
            .replace('打刀', '')
            .replace('刀', '')
            .replace('額銘', '')
            .replace('銘', '')
            .trim();
          
          if (!searchQuery && keyword.includes('（')) {
            searchQuery = keyword.match(/（([^）]+)）/)?.[1] || keyword;
          }
          if (!searchQuery) searchQuery = keyword;
        }

        if (!searchQuery) return;

        // Search Japan Search API
        const apiUrl = `https://jpsearch.go.jp/api/item/search/jps-cross?keyword=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (!isMounted) return;
        
        // Find the first item with an image (thumbnailUrl)
        const itemWithImage = data.list?.find((item: any) => item.common && item.common.thumbnailUrl && item.common.thumbnailUrl.length > 0);
        
        if (itemWithImage) {
          setImgUrl(itemWithImage.common.thumbnailUrl[0]);
        }
      } catch (err) {
        console.error("Japan Search API Fetch Error:", err);
      }
    };

    fetchFromApi();
    return () => { isMounted = false; };
  }, [keyword, localSrc]);

  if (!imgUrl) {
    return <div className={`flex items-center justify-center text-5xl opacity-20 bg-black/5 w-full h-full object-cover ${className || ''}`}>🗡️</div>;
  }

  return <img src={imgUrl} alt={alt} className={`w-full h-full object-cover ${className || ''}`} />;
}

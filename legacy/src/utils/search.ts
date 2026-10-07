import { swords } from "../data/swords";
import type { Sword } from "../data/swords";

export const searchSwords = (query: string): Sword[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return swords.filter(sword => 
    sword.name.toLowerCase().includes(lowerQuery) ||
    sword.reading.toLowerCase().includes(lowerQuery) ||
    sword.smith.toLowerCase().includes(lowerQuery) ||
    sword.school.toLowerCase().includes(lowerQuery)
  );
};

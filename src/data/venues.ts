export const venues: Record<string, { lat: number; lng: number; x: number; y: number }> = {
  "東京国立博物館 平成館": { lat: 35.718, lng: 139.776, x: 68, y: 55 },
  "坂城町 鉄の展示館": { lat: 36.463, lng: 138.181, x: 57, y: 47 },
  "真田宝物館": { lat: 36.563, lng: 138.196, x: 57, y: 46 },
  "京都国立博物館 平成知新館": { lat: 34.989, lng: 135.773, x: 42, y: 59 },
  "北野天満宮 宝物殿": { lat: 35.031, lng: 135.735, x: 41.5, y: 58.5 },
  "刀剣博物館": { lat: 35.698, lng: 139.794, x: 68.5, y: 55.5 },
  "致道博物館": { lat: 38.728, lng: 139.824, x: 71, y: 34 },
  "佐野美術館": { lat: 35.115, lng: 138.918, x: 61, y: 62 },
  "石川県立美術館": { lat: 36.559, lng: 136.662, x: 47, y: 45 }
};

// Y goes from top(0) to bottom(100), X goes from left(0) to right(100)
// This will map latitude/longitude to a rough % on the Ukiyo-e style map image.
// We have hand-coded x and y for simplicity and aesthetic placement on the static map image.


export interface LocalPlace {
  name: string;
  category: string;
  rating: number;
  reviewCount?: number;
  address: string;
  distance?: string;
  imageUrl?: string;
  mapsUrl: string;
  isOpen?: boolean;
  snippet?: string;
}

export interface SearchResponse {
  places: LocalPlace[];
  summary: string;
  groundingLinks: Array<{ title: string; uri: string }>;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

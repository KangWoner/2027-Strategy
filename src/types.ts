export interface University {
  id: number;
  name: string;
  category: string;
  type: 'essay' | 'short';
  reflection: string;
  csat_min: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  groundingMetadata?: any;
}

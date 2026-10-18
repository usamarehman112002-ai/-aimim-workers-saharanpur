export type LeadershipCategory = 
  | 'national' 
  | 'state' 
  | 'west_up' 
  | 'district' 
  | 'assembly';

export interface LeaderProfile {
  id: string;
  category: LeadershipCategory;
  categoryLabel: string;
  name: string;
  role: string;
  roleSubtitle?: string;
  assemblyName?: string;
  assemblyCode?: string;
  photoUrl: string;
  phone?: string;
  whatsapp?: string;
  quote?: string;
  city?: string;
  order: number;
}

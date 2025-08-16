export interface CampInfo {
    location: string;
    date: string;
    price: string;
    participants: number;
  }
  
  export interface Facility {
    icon: string;
    name: string;
  }
  
  export interface ProgramDay {
    day: number;
    title: string;
    activities: string[];
    icon: string;
  }
  
  export interface ChecklistItem {
    icon: string;
    name: string;
    required: boolean;
  }
  
  export interface Review {
    id: number;
    name: string;
    avatar: string;
    text: string;
    rating: number;
  }
  
  export interface GalleryImage {
    id: number;
    src: string;
    alt: string;
    category: 'camp' | 'activities' | 'art';
  }
  
  export interface ContactLink {
    icon: string;
    name: string;
    url: string;
    type: 'telegram' | 'social' | 'bot';
  }
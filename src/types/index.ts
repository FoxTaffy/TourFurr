// Основная информация о лагере
export interface CampInfo {
  location: string;
  date: string;
  price: string;
  participants: number;
  mysticalLevel?: string;
}

// Удобства лагеря с мистическими свойствами
export interface Facility {
  icon: string;
  name: string;
  mystical?: boolean;
}

// Программа дня с мистическими активностями
export interface ProgramDay {
  day: number;
  title: string;
  activities: string[];
  icon: string;
}

// Мистические активности с детальным описанием
export interface MysticalActivity {
  name: string;
  mysticalDescription: string;
}

export interface MysticalProgramDay extends Omit<ProgramDay, 'activities'> {
  activities: MysticalActivity[];
}

// События временной линии
export interface TimelineEvent {
  time: string;
  event: string;
  icon: string;
}

// Предметы чеклиста с мистическими свойствами
export interface ChecklistItem {
  icon: string;
  name: string;
  required: boolean;
}

export interface MysticalItem {
  icon: string;
  name: string;
  mysticalDescription: string;
  mysticalPower: string;
  mysticalType: string;
  importance?: number;
  bonusLevel?: number;
}

// Шаги ритуала подготовки
export interface RitualStep {
  icon: string;
  title: string;
  description: string;
  effect: string;
}

// Отзывы с мистическими элементами
export interface Review {
  id: number;
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface MysticalReview {
  id: number;
  name: string;
  furrySpecies: string;
  mysticalTitle: string;
  rating: number;
  text: string;
  experienceType: string;
  experiences: string[];
  likes?: number;
}

// Мистическая статистика
export interface MysticalStat {
  icon: string;
  value: string;
  label: string;
}

// Галерея изображений с мистическими свойствами
export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: 'camp' | 'activities' | 'art';
}

export interface MysticalGalleryImage {
  id: number;
  src: string;
  alt: string;
  category: 'camp' | 'activities' | 'art' | 'atmosphere';
  mysticalDescription: string;
  mysticalPower: number;
}

// Архив прошлых лагерей
export interface PastCamp {
  year: string;
  name: string;
  participants: number;
  mysticalEvent: string;
}

// Контакты и ссылки с мистическими свойствами
export interface ContactLink {
  icon: string;
  name: string;
  url: string;
  type: 'telegram' | 'social' | 'bot';
}

export interface MysticalContactLink {
  name: string;
  description: string;
  url: string;
  icon: string;
  type: string;
  mysticalPurpose: string;
  memberCount?: string;
}

export interface MysticalSocialLink {
  name: string;
  description: string;
  url: string;
  icon: string;
  platform: string;
  mysticalPower: string;
  content: string;
}

// Организаторы лагеря
export interface Organizer {
  role: string;
  description: string;
  icon: string;
}

// Категории галереи
export interface GalleryCategory {
  value: string;
  name: string;
  icon: string;
}

// Мистические эффекты и стили
export type MysticalEffectType = 
  | 'ember-effect' 
  | 'neon-glow' 
  | 'carved-text' 
  | 'ritual-text' 
  | 'ancient-text' 
  | 'shadow-text' 
  | 'horror-text' 
  | 'forest-text' 
  | 'blood-effect';

export type MysticalItemType = 
  | 'protection' 
  | 'comfort' 
  | 'survival' 
  | 'alchemy' 
  | 'divination' 
  | 'ritual' 
  | 'transformation' 
  | 'exploration' 
  | 'enchantment' 
  | 'entertainment';

export type ExperienceType = 
  | 'spiritual' 
  | 'adventure' 
  | 'initiation' 
  | 'mastery' 
  | 'discovery' 
  | 'mystical';

// Фурри виды для аватаров
export type FurrySpecies = 
  | 'fox' 
  | 'wolf' 
  | 'cat' 
  | 'dragon' 
  | 'raccoon' 
  | 'owl' 
  | 'bear' 
  | 'rabbit' 
  | 'deer' 
  | 'bird';

// Уровни мистической силы
export type MysticalPowerLevel = 1 | 2 | 3 | 4 | 5;

// Категории галереи
export type GalleryCategoryType = 'all' | 'camp' | 'activities' | 'art' | 'atmosphere';

// Типы контактов
export type ContactType = 'bot' | 'chat' | 'channel';

// Социальные платформы
export type SocialPlatform = 'vk' | 'instagram' | 'discord' | 'telegram';

// Интерфейс для мистических символов
export interface MysticalSymbol {
  symbol: string;
  meaning: string;
  power: MysticalPowerLevel;
}

// Интерфейс для конфигурации анимаций
export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

// Интерфейс для тематических цветов
export interface ThemeColors {
  dark: string;
  blood: string;
  wood: string;
  gold: string;
  bone: string;
  green: string;
  fire: string;
  shadow: string;
  mist: string;
}

// Экспорт всех констант и утилит
export const MYSTICAL_SYMBOLS = [
  '✦', '✧', '◆', '◇', '▲', '▼', '●', '◐', '◑', '◒', '☾', '☽'
] as const;

export const RUNE_SYMBOLS = [
  'ᚦ', 'ᚱ', 'ᚢ', 'ᚨ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'
] as const;

export const FURRY_SPECIES_ICONS: Record<string, string> = {
  fox: 'fas fa-paw',
  wolf: 'fas fa-wolf',
  cat: 'fas fa-cat',
  dragon: 'fas fa-dragon',
  raccoon: 'fas fa-mask',
  owl: 'fas fa-crow',
  bear: 'fas fa-paw',
  rabbit: 'fas fa-rabbit',
  deer: 'fas fa-deer',
  bird: 'fas fa-dove'
};

export const MYSTICAL_EFFECTS: Record<string, string> = {
  protection: 'ember-effect',
  comfort: 'neon-glow',
  survival: 'carved-text',
  alchemy: 'ritual-text',
  divination: 'shadow-text',
  ritual: 'ancient-text',
  transformation: 'horror-text',
  exploration: 'forest-text',
  enchantment: 'neon-glow',
  entertainment: 'blood-effect'
};

// Утилитарные типы
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Типы событий
export interface MysticalEvent {
  id: string;
  name: string;
  type: 'ritual' | 'quest' | 'tournament' | 'gathering';
  startTime: string;
  duration: number;
  participants: number;
  mysticalLevel: MysticalPowerLevel;
  description: string;
}

// Конфигурация приложения
export interface AppConfig {
  theme: ThemeColors;
  animations: AnimationConfig;
  mysticalMode: boolean;
  soundEffects: boolean;
  particleEffects: boolean;
}

// Состояние пользователя
export interface UserState {
  isRegistered: boolean;
  mysticalLevel: MysticalPowerLevel;
  favoriteEvents: string[];
  completedQuests: string[];
  unlockedAchievements: string[];
}

// Интерфейс для достижений
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  mysticalPower: MysticalPowerLevel;
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
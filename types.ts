
export enum UserRole {
  SPEAKER = 'SPEAKER', // Wants to talk about their problems
  LISTENER = 'LISTENER' // Wants to listen and earn
}

export interface UserProfile {
  name: string; // Nickname
  ageRange: string;
  role: UserRole;
  mood: string;
  bio: string; // Brief description of situation
  topics: string[];
  earnings: number;
  avatar?: string; // Base64 image string
}

export interface Message {
  id: string;
  sender: 'user' | 'peer' | 'system';
  text: string;
  timestamp: Date;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  MATCHING = 'MATCHING',
  CHATTING = 'CHATTING'
}

export interface Room {
  roomId: string;
  host: UserProfile;
  guest?: UserProfile;
  status: 'waiting' | 'connected' | 'ended';
  createdAt: number;
}

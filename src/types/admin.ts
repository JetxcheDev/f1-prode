import { Timestamp } from 'firebase/firestore';

// Base interfaces for admin entities
export interface BaseEntity {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Pilot related types
export interface Pilot extends BaseEntity {
  name: string;
  team: string;
  number: number;
  country: string;
  active: boolean;
}

export interface PilotFormData {
  name: string;
  team: string;
  number: number;
  country: string;
  active: boolean;
}

// Race related types
export type RaceStatus = 'upcoming' | 'active' | 'completed';

export interface Race extends BaseEntity {
  name: string;
  location: string;
  date: Timestamp;
  votingDeadline: Timestamp;
  status: RaceStatus;
}

export interface RaceFormData {
  name: string;
  location: string;
  date: string;
  votingDeadline: string;
  status: RaceStatus;
}

// Result related types
export interface RaceResult extends BaseEntity {
  raceId: string;
  pole: string;
  positions: string[];
  crashPilot?: string;
}

export interface ResultData {
  pole: string;
  positions: string[];
  crashPilot: string;
}

// User related types
export type UserRole = 'admin' | 'user';

export interface UserProfile extends BaseEntity {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

// Vote related types
export interface Vote extends BaseEntity {
  userId: string;
  raceId: string;
  pole: string;
  positions: string[];
  crashPilot?: string;
}

export interface ScoreBreakdown {
  pole: { predicted: string; actual: string; points: number };
  positions: { predicted: string; actual: string; points: number; position: number }[];
  crash: { predicted: string; actual: string; points: number };
}

// Statistics types
export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  usersThisMonth: number;
  growthRate: number;
}

export interface PilotStats {
  total: number;
  active: number;
  inactive: number;
}

export interface RaceStats {
  total: number;
  upcoming: number;
  active: number;
  completed: number;
  totalRaces: number;
  racesWithResults: number;
  completionRate: number;
}

export interface ScoringStats {
  totalUsers: number;
  averageScore: number;
  highestScore: number;
}
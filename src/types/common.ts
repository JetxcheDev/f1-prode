// Common types used across the application

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SearchState {
  searchTerm: string;
  filters: Record<string, any>;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Generic CRUD operations
export interface CrudOperations<T> {
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  submitting: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  className?: string;
  children?: React.ReactNode;
}

export interface UserScore {
  userId: string;
  displayName: string;
  email: string;
  totalPoints: number;
  poleAccuracy: number;
  crashAccuracy: number;
  positionAccuracy: number;
  racesParticipated: number;
  poleHits: number;
  crashHits: number;
  positionHits: number;
  totalPoleVotes: number;
  totalCrashVotes: number;
  totalPositionVotes: number;
  hasVoted?: boolean;
}

export interface RankingStats {
  topOverall: UserScore[];
  topPoleAccuracy: UserScore[];
  topCrashAccuracy: UserScore[];
  topPositionAccuracy: UserScore[];
  allUsers: UserScore[];
}

export interface UseRankingReturn {
  rankings: RankingStats;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}
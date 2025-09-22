// Re-export Firestore types for centralized access
export { Timestamp, DocumentReference, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore';

// Custom Firestore utility types
export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

export interface FirestoreCollection<T> {
  docs: T[];
  loading: boolean;
  error: string | null;
}

export interface FirestoreQuery {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains';
  value: any;
}

export interface FirestoreOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FirestoreOptions {
  where?: FirestoreQuery[];
  orderBy?: FirestoreOrderBy[];
  limit?: number;
  startAfter?: any;
}
import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase';
import { FirestoreOptions, FirestoreCollection, LoadingState } from '@/types';
import { toast } from 'sonner';

// Generic Firestore collection hook
export function useFirestoreCollection<T>(
  collectionName: string,
  options: FirestoreOptions = {},
  realtime = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const buildQuery = useCallback(() => {
    let q = collection(db, collectionName);
    let queryRef: any = q;

    // Apply where clauses
    if (options.where) {
      options.where.forEach(({ field, operator, value }) => {
        queryRef = query(queryRef, where(field, operator, value));
      });
    }

    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(({ field, direction }) => {
        queryRef = query(queryRef, orderBy(field, direction));
      });
    }

    // Apply pagination
    if (options.startAfter) {
      queryRef = query(queryRef, startAfter(options.startAfter));
    }

    if (options.limit) {
      queryRef = query(queryRef, limit(options.limit));
    }

    return queryRef;
  }, [collectionName, options]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryRef = buildQuery();
      const snapshot = await getDocs(queryRef);
      
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as object)
      })) as T[];
      
      setData(documents);
      
      // Store last document for pagination
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al cargar ${collectionName}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, collectionName]);

  const loadMore = useCallback(async () => {
    if (!lastDoc) return;

    try {
      const queryRef = buildQuery();
      const paginatedQuery = query(queryRef, startAfter(lastDoc));
      const snapshot = await getDocs(paginatedQuery);
      
      const newDocuments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as object)
      })) as T[];
      
      setData(prev => [...prev, ...newDocuments]);
      
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al cargar más ${collectionName}: ${errorMessage}`);
    }
  }, [buildQuery, lastDoc, collectionName]);

  // Setup realtime listener
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    if (realtime) {
      const queryRef = buildQuery();
      
      unsubscribe = onSnapshot(
        queryRef,
        (snapshot: any) => {
          const documents = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...(doc.data() as object)
          })) as T[];
          
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          const errorMessage = err.message || 'Error desconocido';
          setError(errorMessage);
          setLoading(false);
          toast.error(`Error en tiempo real ${collectionName}: ${errorMessage}`);
        }
      );
    } else {
      loadData();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [buildQuery, realtime, loadData, collectionName]);

  return {
    data,
    loading,
    error,
    loadData,
    loadMore,
    hasMore: !!lastDoc,
    refresh: loadData
  };
}

// Generic Firestore document hook
export function useFirestoreDocument<T>(
  collectionName: string,
  documentId: string | null,
  realtime = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        setData(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al cargar documento: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId]);

  // Setup realtime listener
  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe | null = null;

    if (realtime) {
      const docRef = doc(db, collectionName, documentId);
      
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          const errorMessage = err.message || 'Error desconocido';
          setError(errorMessage);
          setLoading(false);
          toast.error(`Error en tiempo real: ${errorMessage}`);
        }
      );
    } else {
      loadDocument();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, documentId, realtime, loadDocument]);

  return {
    data,
    loading,
    error,
    loadDocument,
    refresh: loadDocument
  };
}

// CRUD operations hook
export function useFirestoreCrud<T>(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: Partial<T>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  return {
    create,
    update,
    delete: remove,
    loading
  };
}

// Specialized hooks for specific collections
export function usePilotsCollection(realtime = false) {
  return useFirestoreCollection('pilots', {
    orderBy: [{ field: 'number', direction: 'asc' }]
  }, realtime);
}

export function useRacesCollection(realtime = false) {
  return useFirestoreCollection('races', {
    orderBy: [{ field: 'date', direction: 'desc' }]
  }, realtime);
}

export function useUsersCollection(realtime = false) {
  return useFirestoreCollection('users', {
    orderBy: [{ field: 'createdAt', direction: 'desc' }]
  }, realtime);
}

export function useVotesForRace(raceId: string | null, realtime = false) {
  return useFirestoreCollection('votes', {
    where: raceId ? [{ field: 'raceId', operator: '==', value: raceId }] : undefined
  }, realtime);
}

export function useResultsCollection(realtime = false) {
  return useFirestoreCollection('results', {
    orderBy: [{ field: 'createdAt', direction: 'desc' }]
  }, realtime);
}

// Hook for batch operations
export function useFirestoreBatch() {
  const [loading, setLoading] = useState(false);

  const executeBatch = useCallback(async (operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: any;
  }>) => {
    setLoading(true);
    try {
      // Note: This would need to be implemented with Firebase batch operations
      // For now, we'll execute operations sequentially
      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            await addDoc(collection(db, operation.collection), operation.data);
            break;
          case 'update':
            if (operation.id) {
              await updateDoc(doc(db, operation.collection, operation.id), operation.data);
            }
            break;
          case 'delete':
            if (operation.id) {
              await deleteDoc(doc(db, operation.collection, operation.id));
            }
            break;
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executeBatch,
    loading
  };
}
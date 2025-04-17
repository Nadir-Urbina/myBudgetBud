import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper function to convert Firestore timestamps to Date objects
function convertTimestamps(data: DocumentData): DocumentData {
  const result = { ...data };
  
  for (const key in result) {
    // Check if the value is a Firestore Timestamp
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
    // Handle string timestamp formats
    else if (typeof result[key] === 'string' && 
             /\d{4}-\d{2}-\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/.test(result[key])) {
      try {
        const date = new Date(result[key]);
        if (!isNaN(date.getTime())) {
          result[key] = date;
        }
      } catch (e) {
        // If parsing fails, keep the original value
      }
    }
  }
  
  return result;
}

export function useCollection<T>(
  collectionName: string,
  userId: string,
  orderByField?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh data manually
  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let q = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );

        if (orderByField) {
          q = query(q, orderBy(orderByField, 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Convert timestamp fields for this document
          const convertedData = convertTimestamps(data);
          
          return {
            id: doc.id,
            ...convertedData,
          };
        }) as T[];

        setData(items);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [collectionName, userId, orderByField, refreshTrigger]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      refresh(); // Trigger a refresh after adding
      return { id: docRef.id, ...item };
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, item as DocumentData);
      refresh(); // Trigger a refresh after updating
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      refresh(); // Trigger a refresh after removing
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    refresh,
  };
}

export function useDocument<T>(collectionName: string, documentId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh data manually
  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Convert timestamp fields
          const convertedData = convertTimestamps(data);
          
          setData({ id: docSnap.id, ...convertedData } as T);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchData();
    }
  }, [collectionName, documentId, refreshTrigger]);

  const update = async (item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, item as DocumentData);
      refresh(); // Trigger a refresh after updating
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    update,
    refresh,
  };
} 
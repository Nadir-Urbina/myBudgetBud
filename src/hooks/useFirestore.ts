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
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T>(
  collectionName: string,
  userId: string,
  orderByField?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let q = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );

        if (orderByField) {
          q = query(q, orderBy(orderByField, 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(items);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [collectionName, userId, orderByField]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      return docRef.id;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, item as DocumentData);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
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
  };
}

export function useDocument<T>(collectionName: string, documentId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
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
  }, [collectionName, documentId]);

  const update = async (item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, item as DocumentData);
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
  };
} 
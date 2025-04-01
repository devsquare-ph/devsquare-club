import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { TechnologyStack } from '../types';

const COLLECTION_NAME = 'technology_stacks';

export const createTechnologyStack = async (techData: Omit<TechnologyStack, 'uid' | 'created_date' | 'modified_date'>): Promise<TechnologyStack> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...techData,
    created_date: serverTimestamp(),
    modified_date: serverTimestamp(),
  });

  const newTech = {
    uid: docRef.id,
    ...techData,
    created_date: Timestamp.now(),
    modified_date: Timestamp.now(),
  };

  return newTech;
};

export const updateTechnologyStack = async (uid: string, techData: Partial<Omit<TechnologyStack, 'uid' | 'created_date' | 'modified_date'>>): Promise<void> => {
  const techRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(techRef, {
    ...techData,
    modified_date: serverTimestamp(),
  });
};

export const getTechnologyStack = async (uid: string): Promise<TechnologyStack | null> => {
  const techRef = doc(db, COLLECTION_NAME, uid);
  const techDoc = await getDoc(techRef);
  
  if (!techDoc.exists()) {
    return null;
  }

  return { uid: techDoc.id, ...techDoc.data() } as TechnologyStack;
};

export const getAllTechnologyStacks = async (includeInactive: boolean = false): Promise<TechnologyStack[]> => {
  const techCollection = collection(db, COLLECTION_NAME);
  
  let techQuery;
  if (!includeInactive) {
    techQuery = query(techCollection, where('is_active', '==', true));
  } else {
    techQuery = techCollection;
  }

  const querySnapshot = await getDocs(techQuery);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as TechnologyStack[];
};

export const softDeleteTechnologyStack = async (uid: string): Promise<void> => {
  const techRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(techRef, {
    is_active: false,
    modified_date: serverTimestamp(),
  });
};

export const reactivateTechnologyStack = async (uid: string): Promise<void> => {
  const techRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(techRef, {
    is_active: true,
    modified_date: serverTimestamp(),
  });
}; 
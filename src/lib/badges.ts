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
import { Badge } from '../types';

const COLLECTION_NAME = 'badges';

export const createBadge = async (badgeData: Omit<Badge, 'uid' | 'created_date' | 'modified_date'>): Promise<Badge> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...badgeData,
    created_date: serverTimestamp(),
    modified_date: serverTimestamp(),
  });

  const newBadge = {
    uid: docRef.id,
    ...badgeData,
    created_date: Timestamp.now(),
    modified_date: Timestamp.now(),
  };

  return newBadge;
};

export const updateBadge = async (uid: string, badgeData: Partial<Omit<Badge, 'uid' | 'created_date' | 'modified_date'>>): Promise<void> => {
  const badgeRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(badgeRef, {
    ...badgeData,
    modified_date: serverTimestamp(),
  });
};

export const getBadge = async (uid: string): Promise<Badge | null> => {
  const badgeRef = doc(db, COLLECTION_NAME, uid);
  const badgeDoc = await getDoc(badgeRef);
  
  if (!badgeDoc.exists()) {
    return null;
  }

  return { uid: badgeDoc.id, ...badgeDoc.data() } as Badge;
};

export const getBadges = async (includeInactive: boolean = false): Promise<Badge[]> => {
  const badgeCollection = collection(db, COLLECTION_NAME);
  
  let badgeQuery;
  if (!includeInactive) {
    badgeQuery = query(badgeCollection, where('is_active', '==', true));
  } else {
    badgeQuery = badgeCollection;
  }

  const querySnapshot = await getDocs(badgeQuery);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as Badge[];
};

export const softDeleteBadge = async (uid: string): Promise<void> => {
  const badgeRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(badgeRef, {
    is_active: false,
    modified_date: serverTimestamp(),
  });
};

export const reactivateBadge = async (uid: string): Promise<void> => {
  const badgeRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(badgeRef, {
    is_active: true,
    modified_date: serverTimestamp(),
  });
};

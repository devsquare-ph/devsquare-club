import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { User, Badge, Project, TechnologyStack } from '@/types';

// Type for Firebase update operations
type FirestoreData = {
  [key: string]: string | number | boolean | null | FieldValue | Date | FirestoreData | Array<string | number | boolean | null | FieldValue | Date | FirestoreData>;
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map((doc) => doc.data() as User);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const updateUser = async (id: string, userData: Partial<User>) => {
  const userRef = doc(db, 'users', id);
  
  // Create a clean object with no undefined values
  const cleanData = Object.entries(userData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as FirestoreData);
  
  // Add the modified_date
  cleanData.modified_date = serverTimestamp();
  
  await updateDoc(userRef, cleanData);
};

export const createUser = async (userData: Omit<User, 'uid' | 'created_date' | 'modified_date' | 'is_active'>) => {
  const userRef = doc(collection(db, 'users'));
  
  // Create a clean object with no undefined values
  const cleanData = Object.entries(userData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as FirestoreData);
  
  // Add required fields
  cleanData.uid = userRef.id;
  cleanData.is_active = true;
  cleanData.created_date = serverTimestamp();
  cleanData.modified_date = serverTimestamp();
  
  await setDoc(userRef, cleanData);
  return userRef.id;
};

export const deleteUser = async (id: string) => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, {
    is_active: false,
    modified_date: serverTimestamp(),
  });
};

export const reactivateUser = async (id: string) => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, {
    is_active: true,
    modified_date: serverTimestamp(),
  });
};

// Badges
export const getBadges = async (): Promise<Badge[]> => {
  const querySnapshot = await getDocs(collection(db, 'badges'));
  return querySnapshot.docs.map((doc) => doc.data() as Badge);
};

export const getBadgeById = async (id: string): Promise<Badge | null> => {
  const docRef = doc(db, 'badges', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Badge) : null;
};

export const createBadge = async (badgeData: Omit<Badge, 'uid' | 'created_date' | 'modified_date'>) => {
  const badgeRef = doc(collection(db, 'badges'));
  await setDoc(badgeRef, {
    uid: badgeRef.id,
    ...badgeData,
    created_date: serverTimestamp(),
    modified_date: serverTimestamp(),
  });
  return badgeRef.id;
};

export const updateBadge = async (id: string, badgeData: Partial<Badge>) => {
  const badgeRef = doc(db, 'badges', id);
  
  // Create a clean object with no undefined values
  const cleanData = Object.entries(badgeData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as FirestoreData);
  
  // Add the modified_date
  cleanData.modified_date = serverTimestamp();
  
  await updateDoc(badgeRef, cleanData);
};

export const deleteBadge = async (id: string) => {
  await deleteDoc(doc(db, 'badges', id));
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  return querySnapshot.docs.map((doc) => doc.data() as Project);
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const docRef = doc(db, 'projects', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Project) : null;
};

export const createProject = async (projectData: Omit<Project, 'uid' | 'created_date' | 'modified_date'>) => {
  const projectRef = doc(collection(db, 'projects'));
  await setDoc(projectRef, {
    uid: projectRef.id,
    ...projectData,
    created_date: serverTimestamp(),
    modified_date: serverTimestamp(),
  });
  return projectRef.id;
};

export const updateProject = async (id: string, projectData: Partial<Project>) => {
  const projectRef = doc(db, 'projects', id);
  
  // Create a clean object with no undefined values
  const cleanData = Object.entries(projectData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as FirestoreData);
  
  // Add the modified_date
  cleanData.modified_date = serverTimestamp();
  
  await updateDoc(projectRef, cleanData);
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, 'projects', id));
};

// Technology Stacks
export const getTechnologyStacks = async (): Promise<TechnologyStack[]> => {
  const querySnapshot = await getDocs(collection(db, 'technology_stacks'));
  return querySnapshot.docs.map((doc) => doc.data() as TechnologyStack);
};

// Image Upload Helper
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  const uploadTask = await uploadBytesResumable(storageRef, file);
  
  return await getDownloadURL(uploadTask.ref);
}; 
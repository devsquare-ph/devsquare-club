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
import { Project } from '../types';

const COLLECTION_NAME = 'projects';

export const createProject = async (projectData: { 
  title: string;
  description?: string;
  image?: string; 
  github_repo?: string;
  website_link?: string;
  categories?: string[];
  tags?: string[];
  technology_stacks?: string[];
  links?: string[];
  is_active: boolean;
}): Promise<Project> => {
  // Create a clean object for Firebase
  const cleanData: Record<string, any> = {
    title: projectData.title,
    description: projectData.description || '',
    is_active: true,
    categories: projectData.categories || [],
    tags: projectData.tags || [],
    technology_stacks: projectData.technology_stacks || [],
    links: projectData.links || [],
  };
  
  // Only add optional fields if they have values
  if (projectData.image) cleanData.image = projectData.image;
  if (projectData.github_repo) cleanData.github_repo = projectData.github_repo;
  if (projectData.website_link) cleanData.website_link = projectData.website_link;
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cleanData,
    created_date: serverTimestamp(),
    modified_date: serverTimestamp(),
  });

  const newProject = {
    uid: docRef.id,
    ...cleanData,
    created_date: Timestamp.now(),
    modified_date: Timestamp.now(),
  };

  return newProject as unknown as Project;
};

export const updateProject = async (uid: string, projectData: {
  title?: string;
  description?: string;
  image?: string;
  github_repo?: string;
  website_link?: string;
  categories?: string[];
  tags?: string[];
  technology_stacks?: string[];
  links?: string[];
  is_active?: boolean;
}): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, uid);
  
  // Create a clean object with no undefined values
  const cleanData: Record<string, any> = {};
  
  if (projectData.title !== undefined) cleanData.title = projectData.title;
  if (projectData.description !== undefined) cleanData.description = projectData.description;
  if (projectData.image !== undefined) cleanData.image = projectData.image;
  if (projectData.github_repo !== undefined) cleanData.github_repo = projectData.github_repo;
  if (projectData.website_link !== undefined) cleanData.website_link = projectData.website_link;
  if (projectData.categories !== undefined) cleanData.categories = projectData.categories;
  if (projectData.tags !== undefined) cleanData.tags = projectData.tags;
  if (projectData.technology_stacks !== undefined) cleanData.technology_stacks = projectData.technology_stacks;
  if (projectData.links !== undefined) cleanData.links = projectData.links;
  if (projectData.is_active !== undefined) cleanData.is_active = projectData.is_active;
  
  // Add the modified_date
  cleanData.modified_date = serverTimestamp();
  
  await updateDoc(projectRef, cleanData);
};

export const getProject = async (uid: string): Promise<Project | null> => {
  const projectRef = doc(db, COLLECTION_NAME, uid);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists()) {
    return null;
  }

  return { uid: projectDoc.id, ...projectDoc.data() } as Project;
};

export const getAllProjects = async (includeInactive: boolean = false): Promise<Project[]> => {
  const projectsCollection = collection(db, COLLECTION_NAME);
  
  let projectsQuery;
  if (!includeInactive) {
    projectsQuery = query(projectsCollection, where('is_active', '==', true));
  } else {
    projectsQuery = projectsCollection;
  }

  const querySnapshot = await getDocs(projectsQuery);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as Project[];
};

export const softDeleteProject = async (uid: string): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(projectRef, {
    is_active: false,
    modified_date: serverTimestamp(),
  });
};

export const reactivateProject = async (uid: string): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(projectRef, {
    is_active: true,
    modified_date: serverTimestamp(),
  });
}; 
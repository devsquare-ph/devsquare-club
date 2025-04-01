import { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  member_since: Timestamp | FieldValue;
  created_date: Timestamp | FieldValue;
  modified_date: Timestamp | FieldValue;
  profile_image?: string;
  github_handle?: string;
  linkedin_profile_link?: string;
  facebook_handle?: string;
  instagram_handle?: string;
  role: 'admin' | 'member';
  is_active?: boolean;
  badges?: string[]; // Array of badge IDs
  projects?: string[]; // Array of project IDs
}

export interface Badge {
  uid: string;
  name: string;
  type: string;
  level: string;
  description: string;
  created_date: Timestamp | FieldValue;
  modified_date: Timestamp | FieldValue;
  image: string;
  is_active: boolean;
}

export interface Project {
  uid: string;
  title: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  technology_stacks?: string[]; // Array of technology stack IDs
  created_date: Timestamp | FieldValue;
  modified_date: Timestamp | FieldValue;
  links?: string[]; // Array of URLs
  image?: string;
  is_active: boolean;
  github_repo?: string;
  website_link?: string;
}

export interface TechnologyStack {
  uid: string;
  name: string;
  description: string;
  image: string;
  created_date: Timestamp | FieldValue;
  modified_date: Timestamp | FieldValue;
  is_active: boolean;
} 
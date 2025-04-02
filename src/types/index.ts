import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  member_since: Timestamp;
  created_date: Timestamp;
  modified_date: Timestamp;
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
  created_date: Timestamp;
  modified_date: Timestamp;
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
  created_date: Timestamp;
  modified_date: Timestamp;
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
  created_date: Timestamp;
  modified_date: Timestamp;
  is_active: boolean;
} 
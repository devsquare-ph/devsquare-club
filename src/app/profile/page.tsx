'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import BadgeCard from '@/components/BadgeCard';
import ProjectCard from '@/components/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { getBadgeById, getProjectById, updateUser, uploadImage } from '@/utils/firebase';
import { Badge, Project } from '@/types';

export default function Profile() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Form fields
  const [githubHandle, setGithubHandle] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [facebookHandle, setFacebookHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Load user data
  useEffect(() => {
    if (!userData) return;

    // Set form fields
    setGithubHandle(userData.github_handle || '');
    setLinkedinProfile(userData.linkedin_profile_link || '');
    setFacebookHandle(userData.facebook_handle || '');
    setInstagramHandle(userData.instagram_handle || '');

    // Load badges and projects
    const fetchUserItems = async () => {
      try {
        // Fetch badges
        if (userData.badges && userData.badges.length > 0) {
          const badgePromises = userData.badges.map(badgeId => getBadgeById(badgeId));
          const badgeResults = await Promise.all(badgePromises);
          setBadges(badgeResults.filter(badge => badge !== null) as Badge[]);
        }

        // Fetch projects
        if (userData.projects && userData.projects.length > 0) {
          const projectPromises = userData.projects.map(projectId => getProjectById(projectId));
          const projectResults = await Promise.all(projectPromises);
          setProjects(projectResults.filter(project => project !== null) as Project[]);
        }
      } catch (error) {
        console.error('Error fetching user items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [userData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userData) return;
    
    setUploading(true);
    
    try {
      let imageUrl = userData.profile_image;
      
      // Upload profile image if selected
      if (profileImage) {
        imageUrl = await uploadImage(profileImage, `profile-images/${user.uid}`);
      }
      
      // Build update data object with defined values only
      const updateData: Partial<{
        github_handle: string;
        linkedin_profile_link: string;
        facebook_handle: string;
        instagram_handle: string;
        profile_image: string;
      }> = {};
      
      // Only add fields that have values (filter out empty strings)
      if (githubHandle) updateData.github_handle = githubHandle;
      if (linkedinProfile) updateData.linkedin_profile_link = linkedinProfile;
      if (facebookHandle) updateData.facebook_handle = facebookHandle;
      if (instagramHandle) updateData.instagram_handle = instagramHandle;
      if (imageUrl) updateData.profile_image = imageUrl;
      
      // Update user data
      await updateUser(user.uid, updateData);
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-48"></div>
          
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                {userData.profile_image ? (
                  <Image 
                    src={userData.profile_image} 
                    alt="Profile" 
                    layout="fill" 
                    objectFit="cover" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-4xl font-semibold text-gray-500">
                    {userData.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{userData.email.split('@')[0]}</h1>
                <p className="text-gray-600">Member since {userData.member_since && 'toDate' in userData.member_since 
                  ? userData.member_since.toDate().toLocaleDateString() 
                  : 'Unknown'}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
            
            {editMode ? (
              // Edit Profile Form
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setProfileImage(e.target.files[0])}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                </div>
                
                <div>
                  <label htmlFor="githubHandle" className="block text-sm font-medium text-gray-700">
                    GitHub Username
                  </label>
                  <input
                    id="githubHandle"
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="linkedinProfile"
                    type="text"
                    value={linkedinProfile}
                    onChange={(e) => setLinkedinProfile(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="facebookHandle" className="block text-sm font-medium text-gray-700">
                    Facebook Username
                  </label>
                  <input
                    id="facebookHandle"
                    type="text"
                    value={facebookHandle}
                    onChange={(e) => setFacebookHandle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700">
                    Instagram Username
                  </label>
                  <input
                    id="instagramHandle"
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              // Profile Display
              <div className="space-y-8">
                {/* Social Links */}
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {userData.github_handle && (
                    <a
                      href={`https://github.com/${userData.github_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-indigo-600"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  
                  {userData.linkedin_profile_link && (
                    <a
                      href={userData.linkedin_profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-indigo-600"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  
                  {userData.facebook_handle && (
                    <a
                      href={`https://facebook.com/${userData.facebook_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-indigo-600"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                  
                  {userData.instagram_handle && (
                    <a
                      href={`https://instagram.com/${userData.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-indigo-600"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>
                
                {/* Badges Section */}
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
                  {loading ? (
                    <p className="text-gray-600">Loading badges...</p>
                  ) : badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {badges.map(badge => (
                        <BadgeCard key={badge.uid} badge={badge} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No badges earned yet.</p>
                  )}
                </div>
                
                {/* Projects Section */}
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
                  {loading ? (
                    <p className="text-gray-600">Loading projects...</p>
                  ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map(project => (
                        <ProjectCard key={project.uid} project={project} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No projects assigned yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUsers, deleteUser, reactivateUser, updateUser, createUser, getProjects } from '@/utils/firebase';
import { createProject, updateProject, softDeleteProject, reactivateProject, getAllProjects } from '@/lib/projects';
import { createBadge, updateBadge, getBadges, softDeleteBadge, reactivateBadge } from '@/lib/badges';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import { Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Modal from '@/components/Modal';
import Navbar from '@/components/Navbar';
import { User, Project, TechnologyStack, Badge } from '@/types';
import moment from 'moment';
import { createTechnologyStack, updateTechnologyStack, softDeleteTechnologyStack, reactivateTechnologyStack, getAllTechnologyStacks } from '@/lib/technologies';

// Define partial types for the user data objects
type CreateUserData = {
  email: string;
  member_since: Timestamp;
  role: 'admin' | 'member';
  profile_image?: string;
  github_handle?: string;
  linkedin_profile_link?: string;
  facebook_handle?: string;
  instagram_handle?: string;
};

type UpdateUserData = {
  role: 'admin' | 'member';
  is_active: boolean;
  profile_image?: string;
  github_handle?: string;
  linkedin_profile_link?: string;
  facebook_handle?: string;
  instagram_handle?: string;
  member_since?: Timestamp;
  badges?: string[];
};

export default function AdminPanel() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [techStacks, setTechStacks] = useState<TechnologyStack[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [showInactiveBadges, setShowInactiveBadges] = useState(false);
  const [showInactiveProjects, setShowInactiveProjects] = useState(false);
  
  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');
  const [newUserGithub, setNewUserGithub] = useState('');
  const [newUserLinkedin, setNewUserLinkedin] = useState('');
  const [newUserFacebook, setNewUserFacebook] = useState('');
  const [newUserInstagram, setNewUserInstagram] = useState('');
  const [newUserMemberSince, setNewUserMemberSince] = useState(new Date().toISOString().split('T')[0]);
  const [addUserError, setAddUserError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit User Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [editUserRole, setEditUserRole] = useState<'admin' | 'member'>('member');
  const [editUserGithub, setEditUserGithub] = useState('');
  const [editUserLinkedin, setEditUserLinkedin] = useState('');
  const [editUserFacebook, setEditUserFacebook] = useState('');
  const [editUserInstagram, setEditUserInstagram] = useState('');
  const [editUserMemberSince, setEditUserMemberSince] = useState('');
  const [editUserError, setEditUserError] = useState('');
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [editProfileImagePreview, setEditProfileImagePreview] = useState<string | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserBadges, setEditUserBadges] = useState<string[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete User Modal State
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Create Badge Modal State
  const [isCreateBadgeModalOpen, setIsCreateBadgeModalOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeLevel, setNewBadgeLevel] = useState('');
  const [newBadgeType, setNewBadgeType] = useState('');
  const [newBadgeDescription, setNewBadgeDescription] = useState('');
  const [newBadgeImage, setNewBadgeImage] = useState<File | null>(null);
  const [newBadgeImagePreview, setNewBadgeImagePreview] = useState<string | null>(null);
  const [createBadgeError, setCreateBadgeError] = useState('');
  const [isCreatingBadge, setIsCreatingBadge] = useState(false);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit Badge Modal State
  const [isEditBadgeModalOpen, setIsEditBadgeModalOpen] = useState(false);
  const [editBadgeData, setEditBadgeData] = useState<Badge | null>(null);
  const [editBadgeName, setEditBadgeName] = useState('');
  const [editBadgeLevel, setEditBadgeLevel] = useState('');
  const [editBadgeType, setEditBadgeType] = useState('');
  const [editBadgeDescription, setEditBadgeDescription] = useState('');
  const [editBadgeImage, setEditBadgeImage] = useState<File | null>(null);
  const [editBadgeImagePreview, setEditBadgeImagePreview] = useState<string | null>(null);
  const [editBadgeError, setEditBadgeError] = useState('');
  const [isEditingBadge, setIsEditingBadge] = useState(false);
  const editBadgeFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Badge Modal State
  const [isDeleteBadgeModalOpen, setIsDeleteBadgeModalOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null);
  const [deleteBadgeError, setDeleteBadgeError] = useState('');
  const [isDeletingBadge, setIsDeletingBadge] = useState(false);
  
  // Project Management State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectImage, setNewProjectImage] = useState<File | null>(null);
  const [newProjectImagePreview, setNewProjectImagePreview] = useState<string | null>(null);
  const [newProjectRepo, setNewProjectRepo] = useState('');
  const [newProjectWebsite, setNewProjectWebsite] = useState('');
  const [newProjectTechStacks, setNewProjectTechStacks] = useState<string[]>([]);
  const [createProjectError, setCreateProjectError] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Project Modal State
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editProjectData, setEditProjectData] = useState<Project | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectImage, setEditProjectImage] = useState<File | null>(null);
  const [editProjectImagePreview, setEditProjectImagePreview] = useState<string | null>(null);
  const [editProjectRepo, setEditProjectRepo] = useState('');
  const [editProjectWebsite, setEditProjectWebsite] = useState('');
  const [editProjectTechStacks, setEditProjectTechStacks] = useState<string[]>([]);
  const [editProjectError, setEditProjectError] = useState('');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const editProjectFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Project Modal State
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteProjectError, setDeleteProjectError] = useState('');
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Tech Stack Management State
  const [isCreateTechStackModalOpen, setIsCreateTechStackModalOpen] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechDescription, setNewTechDescription] = useState('');
  const [newTechImage, setNewTechImage] = useState<File | null>(null);
  const [newTechImagePreview, setNewTechImagePreview] = useState<string | null>(null);
  const [createTechError, setCreateTechError] = useState('');
  const [isCreatingTech, setIsCreatingTech] = useState(false);
  const techFileInputRef = useRef<HTMLInputElement>(null);
  const [showInactiveTechStacks, setShowInactiveTechStacks] = useState(false);

  // Edit Tech Stack Modal State
  const [isEditTechStackModalOpen, setIsEditTechStackModalOpen] = useState(false);
  const [editTechData, setEditTechData] = useState<TechnologyStack | null>(null);
  const [editTechName, setEditTechName] = useState('');
  const [editTechDescription, setEditTechDescription] = useState('');
  const [editTechImage, setEditTechImage] = useState<File | null>(null);
  const [editTechImagePreview, setEditTechImagePreview] = useState<string | null>(null);
  const [editTechError, setEditTechError] = useState('');
  const [isEditingTech, setIsEditingTech] = useState(false);
  const editTechFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Tech Stack Modal State
  const [isDeleteTechStackModalOpen, setIsDeleteTechStackModalOpen] = useState(false);
  const [techToDelete, setTechToDelete] = useState<TechnologyStack | null>(null);
  const [deleteTechError, setDeleteTechError] = useState('');
  const [isDeletingTech, setIsDeletingTech] = useState(false);

  // Add state variables for badge user assignment
  // ... existing code ...
  // Badge User Assignment
  const [isAssignBadgeModalOpen, setIsAssignBadgeModalOpen] = useState(false);
  const [badgeToAssign, setBadgeToAssign] = useState<Badge | null>(null);
  const [selectedUsersForBadge, setSelectedUsersForBadge] = useState<string[]>([]);
  const [assignBadgeError, setAssignBadgeError] = useState('');
  const [isAssigningBadge, setIsAssigningBadge] = useState(false);

  // ... existing code ...

  // Fetch data
  useEffect(() => {
    if (authLoading || !userData || userData.role !== 'admin') return;

    const fetchData = async () => {
      try {
        // Fetch users
        const userData = await getUsers();
        setUsers(userData);

        // Fetch badges (include inactive ones for the admin panel)
        const badgeData = await getBadges(true);
        setBadges(badgeData);
        setAvailableBadges(badgeData.filter(badge => badge.is_active));

        // Fetch projects
        const projectData = await getAllProjects(true);
        setProjects(projectData);

        // Fetch technology stacks
        const techData = await getAllTechnologyStacks(true);
        setTechStacks(techData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, authLoading, userData, showInactiveProjects, showInactiveTechStacks, showInactiveBadges]);

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear profile image
  const handleClearProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle add user form submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    setIsSubmitting(true);
    
    try {
      // Upload profile image to Cloudinary if selected
      let profileImageUrl = '';
      if (profileImage) {
        profileImageUrl = await uploadImageToCloudinary(profileImage);
      }
      
      // Create the auth user
      await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      
      // Build user data object, only including fields that have values
      const userData: CreateUserData = {
        email: newUserEmail,
        member_since: Timestamp.fromDate(new Date(newUserMemberSince)),
        role: newUserRole,
      };
      
      // Only add fields that have values
      if (profileImageUrl) userData.profile_image = profileImageUrl;
      if (newUserGithub) userData.github_handle = newUserGithub;
      if (newUserLinkedin) userData.linkedin_profile_link = newUserLinkedin;
      if (newUserFacebook) userData.facebook_handle = newUserFacebook;
      if (newUserInstagram) userData.instagram_handle = newUserInstagram;
      
      // Create the user document in Firestore
      await createUser(userData);
      
      // Reset form and close modal
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('member');
      setNewUserGithub('');
      setNewUserLinkedin('');
      setNewUserFacebook('');
      setNewUserInstagram('');
      setNewUserMemberSince(new Date().toISOString().split('T')[0]);
      setProfileImage(null);
      setProfileImagePreview(null);
      setIsAddUserModalOpen(false);
      
      // Refresh the users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      setAddUserError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile image change for edit
  const handleEditProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEditProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear profile image for edit
  const handleClearEditProfileImage = () => {
    setEditProfileImage(null);
    setEditProfileImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Open edit user modal
  const handleOpenEditUserModal = (user: User) => {
    setEditUserData(user);
    setEditUserRole(user.role);
    setEditUserGithub(user.github_handle || '');
    setEditUserLinkedin(user.linkedin_profile_link || '');
    setEditUserFacebook(user.facebook_handle || '');
    setEditUserInstagram(user.instagram_handle || '');
    setEditUserBadges(user.badges || []);
    if (user.member_since) {
      setEditUserMemberSince(
        user.member_since.toDate().toISOString().split('T')[0]
      );
    }
    setEditProfileImagePreview(user.profile_image || null);
    setEditUserError('');
    setIsEditUserModalOpen(true);
  };

  // Handle edit user form submission
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserData) return;
    
    setEditUserError('');
    setIsEditingUser(true);
    
    try {
      // Upload profile image to Cloudinary if a new one was selected
      let profileImageUrl = editUserData.profile_image || '';
      if (editProfileImage) {
        profileImageUrl = await uploadImageToCloudinary(editProfileImage);
      }
      
      // Create user update data object
      const updateData: UpdateUserData = {
        role: editUserRole,
        is_active: true,
        github_handle: editUserGithub || undefined,
        linkedin_profile_link: editUserLinkedin || undefined,
        facebook_handle: editUserFacebook || undefined,
        instagram_handle: editUserInstagram || undefined,
      };
      
      // Add profile image if it's not empty
      if (profileImageUrl) {
        updateData.profile_image = profileImageUrl;
      }
      
      // Add badges to update data
      updateData.badges = editUserBadges;
      
      // Add member_since if it's not empty
      if (editUserMemberSince) {
        updateData.member_since = Timestamp.fromDate(new Date(editUserMemberSince));
      }
      
      // Update the user document in Firestore
      await updateUser(editUserData.uid, updateData);
      
      // Reset form and close modal
      setEditUserData(null);
      setEditUserRole('member');
      setEditUserGithub('');
      setEditUserLinkedin('');
      setEditUserFacebook('');
      setEditUserInstagram('');
      setEditUserMemberSince('');
      setEditProfileImage(null);
      setEditProfileImagePreview(null);
      setEditUserBadges([]);
      setIsEditUserModalOpen(false);
      
      // Refresh the users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setEditUserError(errorMessage);
    } finally {
      setIsEditingUser(false);
    }
  };

  // Handle activating a user
  const handleActivateUser = async (userToActivate: User) => {
    try {
      await reactivateUser(userToActivate.uid);
      
      // Refresh the users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  // Open delete user confirmation modal
  const handleOpenDeleteUserModal = (user: User) => {
    setUserToDelete(user);
    setDeleteUserError('');
    setIsDeleteUserModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteUserError('');
    setIsDeletingUser(true);
    
    try {
      // Soft delete the user from Firestore
      await deleteUser(userToDelete.uid);
      
      // Close the modal
      setUserToDelete(null);
      setIsDeleteUserModalOpen(false);
      
      // Refresh the users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate user';
      setDeleteUserError(errorMessage);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Handle badge image change
  const handleBadgeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewBadgeImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setNewBadgeImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear badge image
  const handleClearBadgeImage = () => {
    setNewBadgeImage(null);
    setNewBadgeImagePreview(null);
    if (badgeFileInputRef.current) {
      badgeFileInputRef.current.value = '';
    }
  };

  // Handle create badge form submission
  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBadgeError('');
    setIsCreatingBadge(true);
    
    try {
      // Upload badge image to Cloudinary if selected
      let badgeImageUrl = '';
      if (newBadgeImage) {
        badgeImageUrl = await uploadImageToCloudinary(newBadgeImage);
      }
      
      // Create badge data object
      const badgeData = {
        name: newBadgeName,
        type: newBadgeType,
        description: newBadgeDescription,
        image: badgeImageUrl,
        is_active: true,
        level: newBadgeType === 'Tech Stack' ? newBadgeLevel : '',
      };
      
      // Create the badge in Firestore
      await createBadge(badgeData);
      
      // Reset form and close modal
      setNewBadgeName('');
      setNewBadgeType('');
      setNewBadgeLevel('');
      setNewBadgeDescription('');
      setNewBadgeImage(null);
      setNewBadgeImagePreview(null);
      setIsCreateBadgeModalOpen(false);
      
      // Refresh the badges list
      const updatedBadges = await getBadges();
      setBadges(updatedBadges);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create badge';
      setCreateBadgeError(errorMessage);
    } finally {
      setIsCreatingBadge(false);
    }
  };

  // Edit Badge Handlers
  const handleEditBadgeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditBadgeImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEditBadgeImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear edit badge image
  const handleClearEditBadgeImage = () => {
    setEditBadgeImage(null);
    setEditBadgeImagePreview(null);
    if (editBadgeFileInputRef.current) {
      editBadgeFileInputRef.current.value = '';
    }
  };

  // Open edit badge modal
  const handleOpenEditBadgeModal = (badge: Badge) => {
    setEditBadgeData(badge);
    setEditBadgeName(badge.name);
    setEditBadgeType(badge.type);
    setEditBadgeLevel(badge.level || '');
    setEditBadgeDescription(badge.description);
    setEditBadgeImagePreview(badge.image || null);
    setEditBadgeError('');
    setIsEditBadgeModalOpen(true);
  };

  // Handle edit badge form submission
  const handleEditBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBadgeData) return;
    
    setEditBadgeError('');
    setIsEditingBadge(true);
    
    try {
      // Upload badge image to Cloudinary if a new one was selected
      let badgeImageUrl = editBadgeData.image || '';
      if (editBadgeImage) {
        badgeImageUrl = await uploadImageToCloudinary(editBadgeImage);
      }
      
      // Create badge update data object
      const badgeUpdateData = {
        name: editBadgeName,
        type: editBadgeType,
        description: editBadgeDescription,
        image: badgeImageUrl,
        level: editBadgeType === 'Tech Stack' ? editBadgeLevel : '',
      };
      
      // Update the badge in Firestore
      await updateBadge(editBadgeData.uid, badgeUpdateData);
      
      // Reset form and close modal
      setEditBadgeData(null);
      setEditBadgeName('');
      setEditBadgeType('');
      setEditBadgeLevel('');
      setEditBadgeDescription('');
      setEditBadgeImage(null);
      setEditBadgeImagePreview(null);
      setIsEditBadgeModalOpen(false);
      
      // Refresh the badges list
      const updatedBadges = await getBadges(showInactiveBadges);
      setBadges(updatedBadges);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update badge';
      setEditBadgeError(errorMessage);
    } finally {
      setIsEditingBadge(false);
    }
  };

  // Open delete badge confirmation modal
  const handleOpenDeleteBadgeModal = (badge: Badge) => {
    setBadgeToDelete(badge);
    setDeleteBadgeError('');
    setIsDeleteBadgeModalOpen(true);
  };

  // Handle badge deletion (soft delete)
  const handleDeleteBadge = async () => {
    if (!badgeToDelete) return;
    
    setDeleteBadgeError('');
    setIsDeletingBadge(true);
    
    try {
      // Soft delete the badge from Firestore
      await softDeleteBadge(badgeToDelete.uid);
      
      // Close the modal
      setBadgeToDelete(null);
      setIsDeleteBadgeModalOpen(false);
      
      // Refresh the badges list
      const updatedBadges = await getBadges(showInactiveBadges);
      setBadges(updatedBadges);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate badge';
      setDeleteBadgeError(errorMessage);
    } finally {
      setIsDeletingBadge(false);
    }
  };

  // Handle activating a badge
  const handleActivateBadge = async (badgeToActivate: Badge) => {
    try {
      await reactivateBadge(badgeToActivate.uid);
      
      // Refresh the badges list
      const updatedBadges = await getBadges(showInactiveBadges);
      setBadges(updatedBadges);
    } catch (error) {
      console.error('Error activating badge:', error);
    }
  };

  // Project Management Handlers
  // Handle project image change
  const handleProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProjectImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setNewProjectImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear project image
  const handleClearProjectImage = () => {
    setNewProjectImage(null);
    setNewProjectImagePreview(null);
    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = '';
    }
  };

  // Handle create project form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateProjectError('');
    setIsCreatingProject(true);
    
    try {
      // Upload project image to Cloudinary if selected
      let projectImageUrl = '';
      if (newProjectImage) {
        projectImageUrl = await uploadImageToCloudinary(newProjectImage);
      }
      
      // Create project data object
      const projectData = {
        title: newProjectTitle,
        description: newProjectDescription || '',
        is_active: true,
        image: projectImageUrl || '',
        github_repo: newProjectRepo || '',
        website_link: newProjectWebsite || '',
        categories: [],
        tags: [],
        technology_stacks: newProjectTechStacks,
        links: []
      };
      
      // Create the project in Firestore
      await createProject(projectData);
      
      // Reset form and close modal
      setNewProjectTitle('');
      setNewProjectDescription('');
      setNewProjectImage(null);
      setNewProjectImagePreview(null);
      setNewProjectRepo('');
      setNewProjectWebsite('');
      setNewProjectTechStacks([]);
      setIsCreateProjectModalOpen(false);
      
      // Refresh the projects list
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setCreateProjectError(errorMessage);
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Handle project image change for edit
  const handleEditProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditProjectImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEditProjectImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear project image for edit
  const handleClearEditProjectImage = () => {
    setEditProjectImage(null);
    setEditProjectImagePreview(null);
    if (editProjectFileInputRef.current) {
      editProjectFileInputRef.current.value = '';
    }
  };

  // Open edit project modal
  const handleOpenEditProjectModal = (project: Project) => {
    setEditProjectData(project);
    setEditProjectTitle(project.title);
    setEditProjectDescription(project.description || '');
    setEditProjectImagePreview(project.image || null);
    setEditProjectRepo(project.github_repo || '');
    setEditProjectWebsite(project.website_link || '');
    setEditProjectTechStacks(project.technology_stacks || []);
    setEditProjectError('');
    setIsEditProjectModalOpen(true);
  };

  // Handle edit project form submission
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectData) return;
    
    setEditProjectError('');
    setIsEditingProject(true);
    
    try {
      // Upload project image to Cloudinary if a new one was selected
      let projectImageUrl = editProjectData.image || '';
      if (editProjectImage) {
        projectImageUrl = await uploadImageToCloudinary(editProjectImage);
      }
      
      // Create project update data
      const projectUpdateData = {
        title: editProjectTitle,
        description: editProjectDescription,
        image: projectImageUrl,
        github_repo: editProjectRepo,
        website_link: editProjectWebsite,
        technology_stacks: editProjectTechStacks
      };
      
      // Update the project in Firestore
      await updateProject(editProjectData.uid, projectUpdateData);
      
      // Reset form and close modal
      setEditProjectData(null);
      setEditProjectTitle('');
      setEditProjectDescription('');
      setEditProjectImage(null);
      setEditProjectImagePreview(null);
      setEditProjectRepo('');
      setEditProjectWebsite('');
      setEditProjectTechStacks([]);
      setIsEditProjectModalOpen(false);
      
      // Refresh the projects list
      const updatedProjects = await getAllProjects(showInactiveProjects);
      setProjects(updatedProjects);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setEditProjectError(errorMessage);
    } finally {
      setIsEditingProject(false);
    }
  };

  // Open delete project confirmation modal
  const handleOpenDeleteProjectModal = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectError('');
    setIsDeleteProjectModalOpen(true);
  };

  // Handle project deletion (soft delete)
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeleteProjectError('');
    setIsDeletingProject(true);
    
    try {
      // Soft delete the project from Firestore
      await softDeleteProject(projectToDelete.uid);
      
      // Close the modal
      setProjectToDelete(null);
      setIsDeleteProjectModalOpen(false);
      
      // Refresh the projects list
      const updatedProjects = await getAllProjects(showInactiveProjects);
      setProjects(updatedProjects);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setDeleteProjectError(errorMessage);
    } finally {
      setIsDeletingProject(false);
    }
  };
  
  // Handle activating a project
  const handleActivateProject = async (projectToActivate: Project) => {
    try {
      await reactivateProject(projectToActivate.uid);
      
      // Refresh the projects list
      const updatedProjects = await getAllProjects(showInactiveProjects);
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error activating project:', error);
    }
  };

  // Tech Stack Image Handlers
  const handleTechImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewTechImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setNewTechImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear tech stack image
  const handleClearTechImage = () => {
    setNewTechImage(null);
    setNewTechImagePreview(null);
    if (techFileInputRef.current) {
      techFileInputRef.current.value = '';
    }
  };

  // Handle create tech stack form submission
  const handleCreateTechStack = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTechError('');
    setIsCreatingTech(true);
    
    try {
      // Upload tech image to Cloudinary if selected
      let techImageUrl = '';
      if (newTechImage) {
        techImageUrl = await uploadImageToCloudinary(newTechImage);
      }
      
      // Create tech stack data object
      const techData = {
        name: newTechName,
        description: newTechDescription,
        image: techImageUrl,
        is_active: true
      };
      
      // Create the tech stack in Firestore
      await createTechnologyStack(techData);
      
      // Reset form and close modal
      setNewTechName('');
      setNewTechDescription('');
      setNewTechImage(null);
      setNewTechImagePreview(null);
      setIsCreateTechStackModalOpen(false);
      
      // Refresh the tech stacks list
      const updatedTechStacks = await getAllTechnologyStacks(showInactiveTechStacks);
      setTechStacks(updatedTechStacks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create technology stack';
      setCreateTechError(errorMessage);
    } finally {
      setIsCreatingTech(false);
    }
  };

  // Edit Tech Stack Image Handlers
  const handleEditTechImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditTechImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEditTechImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear edit tech stack image
  const handleClearEditTechImage = () => {
    setEditTechImage(null);
    setEditTechImagePreview(null);
    if (editTechFileInputRef.current) {
      editTechFileInputRef.current.value = '';
    }
  };

  // Open edit tech stack modal
  const handleOpenEditTechStackModal = (tech: TechnologyStack) => {
    setEditTechData(tech);
    setEditTechName(tech.name);
    setEditTechDescription(tech.description || '');
    setEditTechImagePreview(tech.image || null);
    setEditTechError('');
    setIsEditTechStackModalOpen(true);
  };

  // Handle edit tech stack form submission
  const handleEditTechStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTechData) return;
    
    setEditTechError('');
    setIsEditingTech(true);
    
    try {
      // Upload tech image to Cloudinary if selected
      let techImageUrl = editTechData.image || '';
      if (editTechImage) {
        techImageUrl = await uploadImageToCloudinary(editTechImage);
      }
      
      // Build update data object
      const updateData = {
        name: editTechName,
        description: editTechDescription,
        image: techImageUrl,
        is_active: true
      };
      
      // Update the tech stack in Firestore
      await updateTechnologyStack(editTechData.uid, updateData);
      
      // Reset form and close modal
      setEditTechData(null);
      setEditTechName('');
      setEditTechDescription('');
      setEditTechImage(null);
      setEditTechImagePreview(null);
      setIsEditTechStackModalOpen(false);
      
      // Refresh the tech stacks list
      const updatedTechStacks = await getAllTechnologyStacks(showInactiveTechStacks);
      setTechStacks(updatedTechStacks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update technology stack';
      setEditTechError(errorMessage);
    } finally {
      setIsEditingTech(false);
    }
  };

  // Open delete tech stack confirmation modal
  const handleOpenDeleteTechStackModal = (tech: TechnologyStack) => {
    setTechToDelete(tech);
    setDeleteTechError('');
    setIsDeleteTechStackModalOpen(true);
  };

  // Handle tech stack deletion (soft delete)
  const handleDeleteTechStack = async () => {
    if (!techToDelete) return;
    
    setDeleteTechError('');
    setIsDeletingTech(true);
    
    try {
      // Soft delete the tech stack from Firestore
      await softDeleteTechnologyStack(techToDelete.uid);
      
      // Close the modal
      setTechToDelete(null);
      setIsDeleteTechStackModalOpen(false);
      
      // Refresh the tech stacks list
      const updatedTechStacks = await getAllTechnologyStacks(showInactiveTechStacks);
      setTechStacks(updatedTechStacks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete technology stack';
      setDeleteTechError(errorMessage);
    } finally {
      setIsDeletingTech(false);
    }
  };
  
  // Handle activating a tech stack
  const handleActivateTechStack = async (techToActivate: TechnologyStack) => {
    try {
      await reactivateTechnologyStack(techToActivate.uid);
      
      // Refresh the tech stacks list
      const updatedTechStacks = await getAllTechnologyStacks(showInactiveTechStacks);
      setTechStacks(updatedTechStacks);
    } catch (error) {
      console.error('Error activating technology stack:', error);
    }
  };

  // Add new handler functions for badge assignment
  // ... existing code ...

  // Open assign badge to users modal
  const handleOpenAssignBadgeModal = (badge: Badge) => {
    setBadgeToAssign(badge);
    setSelectedUsersForBadge([]);
    setAssignBadgeError('');
    setIsAssignBadgeModalOpen(true);
  };

  // Handle assigning badge to selected users
  const handleAssignBadgeToUsers = async () => {
    if (!badgeToAssign || selectedUsersForBadge.length === 0) return;
    
    setAssignBadgeError('');
    setIsAssigningBadge(true);
    
    try {
      // Update each selected user with the badge
      for (const userId of selectedUsersForBadge) {
        const user = users.find(u => u.uid === userId);
        if (user) {
          const userBadges = user.badges || [];
          // Only add the badge if the user doesn't already have it
          if (!userBadges.includes(badgeToAssign.uid)) {
            await updateUser(userId, {
              badges: [...userBadges, badgeToAssign.uid],
              is_active: true
            });
          }
        }
      }
      
      // Close the modal and refresh users
      setBadgeToAssign(null);
      setSelectedUsersForBadge([]);
      setIsAssignBadgeModalOpen(false);
      
      // Refresh the users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign badge to users';
      setAssignBadgeError(errorMessage);
    } finally {
      setIsAssigningBadge(false);
    }
  };

  // Handle toggling user selection for badge assignment
  const handleToggleUserForBadge = (userId: string) => {
    setSelectedUsersForBadge(current => {
      if (current.includes(userId)) {
        return current.filter(id => id !== userId);
      } else {
        return [...current, userId];
      }
    });
  };

  // ... existing code ...

  if (authLoading || !userData || userData.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading admin panel...</p>
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
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-gray-600">Manage members, badges, projects, and more</p>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                {['users', 'badges', 'projects', 'tech-stacks'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">Loading data...</p>
                </div>
              ) : activeTab === 'users' ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <label htmlFor="show-inactive" className="mr-2 text-sm text-gray-600">
                          Show Inactive Users
                        </label>
                        <input
                          id="show-inactive"
                          type="checkbox"
                          checked={showInactiveUsers}
                          onChange={(e) => setShowInactiveUsers(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <button 
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                        Add User
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
                    <table className="border-collapse table-auto w-full bg-white">
                      <thead>
                        <tr className="text-left text-gray-700">
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Member Since
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Badges
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users
                          .filter(user => showInactiveUsers || user.is_active !== false)
                          .map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                {user.profile_image ? (
                                  <img
                                    src={user.profile_image}
                                    alt={`${user.email} avatar`}
                                    className="h-10 w-10 rounded-full mr-3 object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                  {user.github_handle && (
                                    <div className="text-sm text-gray-500">GitHub: {user.github_handle}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.member_since ? moment(user.member_since.toDate()).format('MMM D, YYYY') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.badges && user.badges.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {user.badges.map((badgeId) => {
                                    const badge = badges.find((b) => b.uid === badgeId);
                                    return badge ? (
                                      <span 
                                        key={badge.uid} 
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                        title={badge.description}
                                      >
                                        {badge.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleOpenEditUserModal(user)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              {user.is_active ? (
                                <button
                                  onClick={() => handleOpenDeleteUserModal(user)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Activate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : activeTab === 'badges' ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Badges</h2>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={showInactiveBadges}
                          onChange={() => setShowInactiveBadges(!showInactiveBadges)}
                        />
                        <span className="ml-2 text-gray-700">Show Inactive</span>
                      </label>
                      <button 
                        onClick={() => setIsCreateBadgeModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                        Create Badge
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {badges.map((badge) => (
                      <div key={badge.uid} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900">{badge.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            badge.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {badge.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{badge.description}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenAssignBadgeModal(badge)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm">
                            Assign
                          </button>
                          <button 
                            onClick={() => handleOpenEditBadgeModal(badge)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm">
                            Edit
                          </button>
                          {project.is_active === false ? (
                            <button 
                              onClick={() => handleActivateProject(project)}
                              className="text-green-600 hover:text-green-900 text-sm">
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOpenDeleteProjectModal(project)}
                              className="text-red-600 hover:text-red-900 text-sm">
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Technology Stacks</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <label htmlFor="show-inactive-tech" className="mr-2 text-sm text-gray-600">
                          Show Inactive Tech Stacks
                        </label>
                        <input
                          id="show-inactive-tech"
                          type="checkbox"
                          checked={showInactiveTechStacks}
                          onChange={(e) => setShowInactiveTechStacks(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <button 
                        onClick={() => setIsCreateTechStackModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                        Add Technology
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {techStacks
                      .filter(tech => showInactiveTechStacks || tech.is_active !== false)
                      .map((tech) => (
                      <div key={tech.uid} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tech.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tech.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {tech.image && (
                          <div className="mt-2">
                            <img 
                              src={tech.image} 
                              alt={tech.name} 
                              className="w-16 h-16 object-cover rounded-md mx-auto"
                            />
                          </div>
                        )}
                        <p className="mt-2 text-sm text-gray-600">{tech.description}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEditTechStackModal(tech)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm">
                            Edit
                          </button>
                          {tech.is_active === false ? (
                            <button 
                              onClick={() => handleActivateTechStack(tech)}
                              className="text-green-600 hover:text-green-900 text-sm">
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOpenDeleteTechStackModal(tech)}
                              className="text-red-600 hover:text-red-900 text-sm">
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New User</h3>
                    
                    <form onSubmit={handleAddUser}>
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          id="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          id="password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                          id="role"
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="member-since" className="block text-sm font-medium text-gray-700">Member Since</label>
                        <input
                          type="date"
                          id="member-since"
                          value={newUserMemberSince}
                          onChange={(e) => setNewUserMemberSince(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub Handle</label>
                        <input
                          type="text"
                          id="github"
                          value={newUserGithub}
                          onChange={(e) => setNewUserGithub(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
                        <input
                          type="text"
                          id="linkedin"
                          value={newUserLinkedin}
                          onChange={(e) => setNewUserLinkedin(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">Facebook Handle</label>
                        <input
                          type="text"
                          id="facebook"
                          value={newUserFacebook}
                          onChange={(e) => setNewUserFacebook(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram Handle</label>
                        <input
                          type="text"
                          id="instagram"
                          value={newUserInstagram}
                          onChange={(e) => setNewUserInstagram(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                        <div className="mt-1 flex items-center">
                          {profileImagePreview ? (
                            <div className="relative">
                              <img 
                                src={profileImagePreview} 
                                alt="Profile preview" 
                                className="h-24 w-24 object-cover rounded-full"
                              />
                              <button
                                type="button"
                                onClick={handleClearProfileImage}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
                              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="hidden"
                              id="profile-image"
                            />
                            <label
                              htmlFor="profile-image"
                              className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              Upload Image
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {addUserError && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {addUserError}
                        </div>
                      )}
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                        >
                          {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddUserModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editUserData && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit User</h3>
                    
                    <form onSubmit={handleEditUser} className="space-y-6">
                      {/* User information fields */}
                      <div className="space-y-4">
                        {editUserData && (
                          <div>
                            <p className="text-gray-500 mb-2">Email: {editUserData.email}</p>
                          </div>
                        )}
                        
                        <div>
                          <label htmlFor="edit-user-role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="edit-user-role"
                            value={editUserRole}
                            onChange={(e) => setEditUserRole(e.target.value as 'admin' | 'member')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-github" className="block text-sm font-medium text-gray-700">
                            GitHub Handle
                          </label>
                          <input
                            type="text"
                            id="edit-user-github"
                            value={editUserGithub}
                            onChange={(e) => setEditUserGithub(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="GitHub username"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-linkedin" className="block text-sm font-medium text-gray-700">
                            LinkedIn Profile
                          </label>
                          <input
                            type="text"
                            id="edit-user-linkedin"
                            value={editUserLinkedin}
                            onChange={(e) => setEditUserLinkedin(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-facebook" className="block text-sm font-medium text-gray-700">
                            Facebook Handle
                          </label>
                          <input
                            type="text"
                            id="edit-user-facebook"
                            value={editUserFacebook}
                            onChange={(e) => setEditUserFacebook(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Facebook username"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-instagram" className="block text-sm font-medium text-gray-700">
                            Instagram Handle
                          </label>
                          <input
                            type="text"
                            id="edit-user-instagram"
                            value={editUserInstagram}
                            onChange={(e) => setEditUserInstagram(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Instagram username"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-member-since" className="block text-sm font-medium text-gray-700">
                            Member Since
                          </label>
                          <input
                            type="date"
                            id="edit-user-member-since"
                            value={editUserMemberSince}
                            onChange={(e) => setEditUserMemberSince(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-user-profile-image" className="block text-sm font-medium text-gray-700">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            id="edit-user-profile-image"
                            ref={editFileInputRef}
                            onChange={handleEditProfileImageChange}
                            accept="image/*"
                            className="hidden"
                          />
                          
                          <div className="mt-1 flex items-center space-x-3">
                            {editProfileImagePreview ? (
                              <div className="relative h-16 w-16">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={editProfileImagePreview}
                                  alt="Profile Preview"
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={handleClearEditProfileImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                                >
                                  <span className="sr-only">Remove</span>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                            >
                              Select Image
                            </button>
                          </div>
                        </div>
                        
                        {/* Badges Section */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Badges
                          </label>
                          
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700">Assigned Badges</h4>
                              {editUserBadges.length === 0 ? (
                                <p className="text-sm text-gray-500 mt-2">No badges assigned</p>
                              ) : (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {editUserBadges.map(badgeId => {
                                    const badge = availableBadges.find(b => b.uid === badgeId);
                                    return badge ? (
                                      <div key={badgeId} className="flex items-center bg-white px-3 py-1 rounded border border-gray-200">
                                        <span className="text-sm text-gray-800">{badge.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => setEditUserBadges(current => current.filter(id => id !== badgeId))}
                                          className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700">Available Badges</h4>
                              <div className="mt-2 max-h-40 overflow-y-auto">
                                {availableBadges.length === 0 ? (
                                  <p className="text-sm text-gray-500">No badges available</p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {availableBadges
                                      .filter(badge => !editUserBadges.includes(badge.uid))
                                      .map(badge => (
                                        <button
                                          key={badge.uid}
                                          type="button"
                                          onClick={() => setEditUserBadges(current => [...current, badge.uid])}
                                          className="flex items-center justify-between px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded text-left"
                                        >
                                          <span className="text-sm text-gray-800">{badge.name}</span>
                                          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {editUserError && (
                        <div className="text-red-500 text-sm">{editUserError}</div>
                      )}
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditUserModalOpen(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isEditingUser}
                          className={`px-4 py-2 rounded-md text-sm font-medium text-white transition ${
                            isEditingUser 
                              ? 'bg-indigo-400' 
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {isEditingUser ? 'Updating...' : 'Update User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteUserModalOpen && userToDelete && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Deactivate User</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to deactivate the user <span className="font-medium">{userToDelete.email}</span>? They will no longer be able to access the system, but their data will be preserved.
                      </p>
                    </div>
                  </div>
                </div>
                
                {deleteUserError && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                    {deleteUserError}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isDeletingUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeletingUser ? 'Deactivating...' : 'Deactivate'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteUserModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Badge Modal */}
      {isCreateBadgeModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Badge</h3>
                    
                    <form onSubmit={handleCreateBadge}>
                      <div className="mb-4">
                        <label htmlFor="badge-name" className="block text-sm font-medium text-gray-700">Badge Name</label>
                        <input
                          type="text"
                          id="badge-name"
                          value={newBadgeName}
                          onChange={(e) => setNewBadgeName(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="badge-type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          id="badge-type"
                          value={newBadgeType}
                          onChange={(e) => setNewBadgeType(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        >
                          <option value="">Select a badge type</option>
                          <option value="Achievements">Achievements</option>
                          <option value="Project">Project</option>
                          <option value="Membership Status">Membership Status</option>
                          <option value="Pathway">Pathway</option>
                          <option value="Role">Role</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Participation">Participation</option>
                          <option value="Ritual">Ritual</option>
                          <option value="Tech Stack">Tech Stack</option>
                        </select>
                      </div>

                      {newBadgeType === 'Tech Stack' && (
                        <div className="mb-4">
                          <label htmlFor="badge-level" className="block text-sm font-medium text-gray-700">Level</label>
                          <input
                            type="text"
                            id="badge-level"
                            value={newBadgeLevel}
                            onChange={(e) => setNewBadgeLevel(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Enter badge level (e.g., Bronze, Silver, Gold, Platinum)"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label htmlFor="badge-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="badge-description"
                          value={newBadgeDescription}
                          onChange={(e) => setNewBadgeDescription(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Badge Image</label>
                        <div className="mt-1 flex items-center">
                          {newBadgeImagePreview ? (
                            <div className="relative">
                              <img 
                                src={newBadgeImagePreview} 
                                alt="Badge preview" 
                                className="h-24 w-24 object-contain"
                              />
                              <button
                                type="button"
                                onClick={handleClearBadgeImage}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
                              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <input
                              type="file"
                              ref={badgeFileInputRef}
                              accept="image/*"
                              onChange={handleBadgeImageChange}
                              className="hidden"
                              id="badge-image"
                            />
                            <label
                              htmlFor="badge-image"
                              className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              Upload Image
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {createBadgeError && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {createBadgeError}
                        </div>
                      )}
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={isCreatingBadge}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                        >
                          {isCreatingBadge ? 'Creating...' : 'Create Badge'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreateBadgeModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Badge Modal */}
      {isEditBadgeModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Badge</h3>
                    
                    <form onSubmit={handleEditBadge}>
                      <div className="mb-4">
                        <label htmlFor="edit-badge-name" className="block text-sm font-medium text-gray-700">Badge Name</label>
                        <input
                          type="text"
                          id="edit-badge-name"
                          value={editBadgeName}
                          onChange={(e) => setEditBadgeName(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="edit-badge-type" className="block text-sm font-medium text-gray-700">Badge Type</label>
                        <select
                          id="edit-badge-type"
                          value={editBadgeType}
                          onChange={(e) => setEditBadgeType(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="Achievement">Achievement</option>
                          <option value="Tech Stack">Tech Stack</option>
                          <option value="Contribution">Contribution</option>
                          <option value="Special">Special</option>
                        </select>
                      </div>

                      {editBadgeType === 'Tech Stack' && (
                        <div className="mb-4">
                          <label htmlFor="edit-badge-level" className="block text-sm font-medium text-gray-700">Level</label>
                          <input
                            type="text"
                            id="edit-badge-level"
                            value={editBadgeLevel}
                            onChange={(e) => setEditBadgeLevel(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Enter badge level (e.g., Bronze, Silver, Gold, Platinum)"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label htmlFor="edit-badge-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="edit-badge-description"
                          value={editBadgeDescription}
                          onChange={(e) => setEditBadgeDescription(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Badge Image</label>
                        <div className="mt-1 flex items-center">
                          {editBadgeImagePreview ? (
                            <div className="relative">
                              <img 
                                src={editBadgeImagePreview} 
                                alt="Badge preview" 
                                className="h-24 w-24 object-contain"
                              />
                              <button
                                type="button"
                                onClick={handleClearEditBadgeImage}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
                              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <input
                              type="file"
                              ref={editBadgeFileInputRef}
                              accept="image/*"
                              onChange={handleEditBadgeImageChange}
                              className="hidden"
                              id="edit-badge-image"
                            />
                            <label
                              htmlFor="edit-badge-image"
                              className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              Upload Image
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {editBadgeError && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                          {editBadgeError}
                        </div>
                      )}
                      
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isEditingBadge}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isEditingBadge ? 'Updating...' : 'Update Badge'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditBadgeModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Badge Modal */}
      {isDeleteBadgeModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Deactivate Badge</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to deactivate this badge? This will hide it from the public view but can be reactivated later.
                      </p>
                    </div>
                  </div>
                </div>
                
                {deleteBadgeError && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                    {deleteBadgeError}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteBadge}
                  disabled={isDeletingBadge}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeletingBadge ? 'Deactivating...' : 'Deactivate'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteBadgeModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => {
          setIsCreateProjectModalOpen(false);
          setNewProjectTitle('');
          setNewProjectDescription('');
          setNewProjectImage(null);
          setNewProjectImagePreview('');
          setNewProjectRepo('');
          setNewProjectWebsite('');
          setNewProjectTechStacks([]);
          setCreateProjectError('');
        }}
        title="Create Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {createProjectError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {createProjectError}
            </div>
          )}
          
          <div>
            <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="project-title"
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="project-description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="project-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="project-image"
                type="file"
                ref={projectFileInputRef}
                onChange={handleProjectImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => projectFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100"
              >
                Select Image
              </button>
              {newProjectImagePreview && (
                <div className="relative">
                  <img
                    src={newProjectImagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearProjectImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="project-repo" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository Link
            </label>
            <input
              id="project-repo"
              type="url"
              value={newProjectRepo}
              onChange={(e) => setNewProjectRepo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://github.com/username/repository"
            />
          </div>
          
          <div>
            <label htmlFor="project-website" className="block text-sm font-medium text-gray-700 mb-1">
              Website Link
            </label>
            <input
              id="project-website"
              type="url"
              value={newProjectWebsite}
              onChange={(e) => setNewProjectWebsite(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="project-tech-stacks" className="block text-sm font-medium text-gray-700 mb-1">
              Technology Stacks
            </label>
            <select
              id="project-tech-stacks"
              multiple
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              value={newProjectTechStacks}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setNewProjectTechStacks(selectedOptions);
              }}
            >
              {techStacks.filter(tech => tech.is_active !== false).map((tech) => (
                <option key={tech.uid} value={tech.uid}>
                  {tech.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple technologies</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              disabled={isCreatingProject}
            >
              {isCreatingProject ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditProjectModalOpen}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditProjectData(null);
          setEditProjectTitle('');
          setEditProjectDescription('');
          setEditProjectImage(null);
          setEditProjectImagePreview(null);
          setEditProjectRepo('');
          setEditProjectWebsite('');
          setEditProjectTechStacks([]);
          setEditProjectError('');
        }}
        title="Edit Project"
      >
        <form onSubmit={handleEditProject} className="space-y-4">
          {editProjectError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {editProjectError}
            </div>
          )}
          
          <div>
            <label htmlFor="edit-project-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="edit-project-title"
              type="text"
              value={editProjectTitle}
              onChange={(e) => setEditProjectTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-project-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="edit-project-description"
              value={editProjectDescription}
              onChange={(e) => setEditProjectDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="edit-project-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="edit-project-image"
                type="file"
                onChange={handleEditProjectImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => editProjectFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100"
              >
                Select Image
              </button>
              {editProjectImagePreview && (
                <div className="relative">
                  <img
                    src={editProjectImagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearEditProjectImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-project-repo" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository Link
            </label>
            <input
              id="edit-project-repo"
              type="url"
              value={editProjectRepo}
              onChange={(e) => setEditProjectRepo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://github.com/username/repository"
            />
          </div>
          
          <div>
            <label htmlFor="edit-project-website" className="block text-sm font-medium text-gray-700 mb-1">
              Website Link
            </label>
            <input
              id="edit-project-website"
              type="url"
              value={editProjectWebsite}
              onChange={(e) => setEditProjectWebsite(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="edit-project-tech-stacks" className="block text-sm font-medium text-gray-700 mb-1">
              Technology Stacks
            </label>
            <select
              id="edit-project-tech-stacks"
              multiple
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              value={editProjectTechStacks}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setEditProjectTechStacks(selectedOptions);
              }}
            >
              {techStacks.filter(tech => tech.is_active !== false).map((tech) => (
                <option key={tech.uid} value={tech.uid}>
                  {tech.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple technologies</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditProjectModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              disabled={isEditingProject}
            >
              {isEditingProject ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Modal */}
      <Modal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => {
          setIsDeleteProjectModalOpen(false);
          setProjectToDelete(null);
          setDeleteProjectError('');
        }}
        title="Deactivate Project"
      >
        <div className="space-y-4">
          {deleteProjectError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {deleteProjectError}
            </div>
          )}
          
          <p className="text-gray-700">
            Are you sure you want to deactivate the project &ldquo;{projectToDelete?.title}&rdquo;? 
            This will hide it from public view.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteProjectModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={isDeletingProject}
            >
              {isDeletingProject ? 'Deactivating...' : 'Deactivate Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Tech Stack Modal */}
      <Modal
        isOpen={isCreateTechStackModalOpen}
        onClose={() => {
          setIsCreateTechStackModalOpen(false);
          setNewTechName('');
          setNewTechDescription('');
          setNewTechImage(null);
          setNewTechImagePreview(null);
          setCreateTechError('');
        }}
        title="Add Technology Stack"
      >
        <form onSubmit={handleCreateTechStack} className="space-y-4">
          {createTechError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {createTechError}
            </div>
          )}
          
          <div>
            <label htmlFor="tech-name" className="block text-sm font-medium text-gray-700 mb-1">
              Technology Name
            </label>
            <input
              id="tech-name"
              type="text"
              value={newTechName}
              onChange={(e) => setNewTechName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="tech-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="tech-description"
              value={newTechDescription}
              onChange={(e) => setNewTechDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label htmlFor="tech-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="tech-image"
                type="file"
                ref={techFileInputRef}
                onChange={handleTechImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => techFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100"
              >
                Select Image
              </button>
              {newTechImagePreview && (
                <div className="relative">
                  <img
                    src={newTechImagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearTechImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateTechStackModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              disabled={isCreatingTech}
            >
              {isCreatingTech ? 'Creating...' : 'Create Technology'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Tech Stack Modal */}
      <Modal
        isOpen={isEditTechStackModalOpen}
        onClose={() => {
          setIsEditTechStackModalOpen(false);
          setEditTechData(null);
          setEditTechName('');
          setEditTechDescription('');
          setEditTechImage(null);
          setEditTechImagePreview(null);
          setEditTechError('');
        }}
        title="Edit Technology Stack"
      >
        <form onSubmit={handleEditTechStack} className="space-y-4">
          {editTechError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {editTechError}
            </div>
          )}
          
          <div>
            <label htmlFor="edit-tech-name" className="block text-sm font-medium text-gray-700 mb-1">
              Technology Name
            </label>
            <input
              id="edit-tech-name"
              type="text"
              value={editTechName}
              onChange={(e) => setEditTechName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-tech-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="edit-tech-description"
              value={editTechDescription}
              onChange={(e) => setEditTechDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-tech-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="edit-tech-image"
                type="file"
                ref={editTechFileInputRef}
                onChange={handleEditTechImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => editTechFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100"
              >
                {editTechData?.image ? 'Change Image' : 'Select Image'}
              </button>
              {(editTechImagePreview || editTechData?.image) && (
                <div className="relative">
                  <img
                    src={editTechImagePreview || editTechData?.image}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearEditTechImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditTechStackModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              disabled={isEditingTech}
            >
              {isEditingTech ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Tech Stack Modal */}
      <Modal
        isOpen={isDeleteTechStackModalOpen}
        onClose={() => {
          setIsDeleteTechStackModalOpen(false);
          setTechToDelete(null);
          setDeleteTechError('');
        }}
        title="Deactivate Technology Stack"
      >
        <div className="space-y-4">
          {deleteTechError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {deleteTechError}
            </div>
          )}
          
          <p className="text-gray-700">
            Are you sure you want to deactivate the technology stack &ldquo;{techToDelete?.name}&rdquo;? 
            This will hide it from public view.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteTechStackModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTechStack}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={isDeletingTech}
            >
              {isDeletingTech ? 'Deactivating...' : 'Deactivate Technology'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
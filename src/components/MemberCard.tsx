import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/types';

interface MemberCardProps {
  user: User;
  badgeCount?: number;
  projectCount?: number;
}

export default function MemberCard({ user, badgeCount = 0, projectCount = 0 }: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
            {user.profile_image ? (
              <Image 
                src={user.profile_image} 
                alt={`${user.email}'s profile`} 
                layout="fill" 
                objectFit="cover" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-gray-500">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.email.split('@')[0]}</h3>
            <p className="text-sm text-gray-500">
              Member since {user.member_since instanceof Date 
                ? user.member_since.toLocaleDateString() 
                : new Date(user.member_since).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <div className="flex-1 bg-indigo-50 rounded-md p-3 text-center">
            <p className="text-3xl font-bold text-indigo-600">{badgeCount}</p>
            <p className="text-sm text-gray-500">Badges</p>
          </div>
          <div className="flex-1 bg-indigo-50 rounded-md p-3 text-center">
            <p className="text-3xl font-bold text-indigo-600">{projectCount}</p>
            <p className="text-sm text-gray-500">Projects</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link 
            href={`/members/${user.uid}`} 
            className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            View Profile
          </Link>
        </div>

        {user.github_handle && (
          <div className="mt-4 flex justify-center">
            <a 
              href={`https://github.com/${user.github_handle}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <span className="text-sm">GitHub</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 
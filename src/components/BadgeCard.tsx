import Image from 'next/image';
import { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 flex flex-col items-center">
        <div className="relative h-24 w-24 mb-4">
          {badge.image ? (
            <Image 
              src={badge.image} 
              alt={badge.name} 
              layout="fill" 
              objectFit="contain" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-full">
              <span className="text-4xl font-bold text-gray-400">
                {badge.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-center text-gray-900">{badge.name}</h3>
        
        <div className="mt-2 flex gap-2">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
            Level: {badge.level}
          </span>
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            {badge.type}
          </span>
        </div>
        
        <p className="mt-3 text-sm text-gray-600 text-center">
          {badge.description}
        </p>
      </div>
    </div>
  );
} 
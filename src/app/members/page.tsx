'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MemberCard from '@/components/MemberCard';
import { getUsers } from '@/utils/firebase';
import { User } from '@/types';

export default function Members() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const users = await getUsers();
        setMembers(users);
      } catch (err) {
        setError('Failed to load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Our Members</h1>
          <p className="mt-4 text-lg text-gray-600">
            Meet the talented developers in our community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading members...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <MemberCard 
                key={member.uid} 
                user={member} 
                badgeCount={member.badges?.length || 0}
                projectCount={member.projects?.length || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
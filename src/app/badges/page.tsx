'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BadgeCard from '@/components/BadgeCard';
import { getBadges } from '@/utils/firebase';
import { Badge } from '@/types';

export default function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const badgeData = await getBadges();
        // Filter to only show active badges
        const activeBadges = badgeData.filter(badge => badge.is_active);
        setBadges(activeBadges);
      } catch (err) {
        setError('Failed to load badges');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Achievement Badges</h1>
          <p className="mt-4 text-lg text-gray-600">
            Badges that members can earn for their achievements
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading badges...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No badges found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <BadgeCard key={badge.uid} badge={badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
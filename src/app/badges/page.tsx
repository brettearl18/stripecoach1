'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BadgeFormModal } from '@/components/badges/BadgeFormModal';
import { toast } from 'sonner';
import {
  TrophyIcon,
  AcademicCapIcon as MedalIcon,
  BoltIcon,
  HeartIcon,
  FireIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  type: 'milestone' | 'streak' | 'achievement' | 'habit';
  pointValue: number;
  color: string;
}

const mockBadges: AchievementBadge[] = [
  {
    id: '1',
    name: 'Consistency Champion',
    description: 'Complete workouts for 30 consecutive days',
    icon: 'trophy',
    criteria: '30 consecutive workout days',
    type: 'streak',
    pointValue: 100,
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  },
  {
    id: '2',
    name: 'Strength Milestone',
    description: 'Achieve a new personal record in any lift',
    icon: 'medal',
    criteria: 'New PR in any lift',
    type: 'milestone',
    pointValue: 50,
    color: 'bg-gradient-to-r from-blue-400 to-blue-600',
  },
  {
    id: '3',
    name: 'Nutrition Master',
    description: 'Log meals consistently for 2 weeks',
    icon: 'heart',
    criteria: '14 days of meal logging',
    type: 'habit',
    pointValue: 75,
    color: 'bg-gradient-to-r from-green-400 to-green-600',
  },
  {
    id: '4',
    name: 'Rapid Progress',
    description: 'Lose 5% body fat in 3 months',
    icon: 'zap',
    criteria: '5% body fat reduction',
    type: 'achievement',
    pointValue: 150,
    color: 'bg-gradient-to-r from-purple-400 to-purple-600',
  },
];

const iconMap = {
  trophy: TrophyIcon,
  medal: MedalIcon,
  zap: BoltIcon,
  heart: HeartIcon,
  flame: FireIcon,
  target: StarIcon,
  award: StarIcon,
};

export default function BadgesManagement() {
  const [badges, setBadges] = useState<AchievementBadge[]>(mockBadges);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | undefined>();

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || badge.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateBadge = (newBadge: Partial<AchievementBadge>) => {
    const badge = {
      ...newBadge,
      id: Date.now().toString(),
      criteria: newBadge.description || '',
    } as AchievementBadge;
    
    setBadges([...badges, badge]);
    toast.success('Badge created successfully');
  };

  const handleEditBadge = (updatedBadge: Partial<AchievementBadge>) => {
    if (!selectedBadge) return;
    
    const updatedBadges = badges.map((badge) =>
      badge.id === selectedBadge.id ? { ...badge, ...updatedBadge } : badge
    );
    
    setBadges(updatedBadges);
    toast.success('Badge updated successfully');
  };

  const handleDeleteBadge = (id: string) => {
    setBadges(badges.filter((badge) => badge.id !== id));
    toast.success('Badge deleted successfully');
  };

  const openEditModal = (badge: AchievementBadge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedBadge(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Achievement Badges</h1>
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Badge
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="w-48">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <FunnelIcon className="h-5 w-5 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="habit">Habit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap];
            return (
              <div
                key={badge.id}
                className={`${badge.color} rounded-lg p-6 shadow-lg relative group`}
              >
                <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(badge)}
                    className="hover:bg-white/20"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="hover:bg-white/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center mb-4">
                  {Icon && <Icon className="h-8 w-8 mr-3" />}
                  <h3 className="text-xl font-semibold">{badge.name}</h3>
                </div>
                <p className="text-sm mb-4">{badge.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-black/20 px-3 py-1 rounded-full">
                    {badge.type}
                  </span>
                  <span className="font-semibold">{badge.pointValue} points</span>
                </div>
              </div>
            );
          })}
        </div>

        <BadgeFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={selectedBadge ? handleEditBadge : handleCreateBadge}
          badge={selectedBadge}
        />
      </div>
    </div>
  );
} 
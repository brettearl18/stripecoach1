'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface BadgeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (badge: Partial<AchievementBadge>) => void;
  badge?: AchievementBadge;
}

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

const defaultBadge: Partial<AchievementBadge> = {
  name: '',
  description: '',
  icon: 'trophy',
  type: 'achievement',
  pointValue: 50,
  color: 'bg-gradient-to-r from-blue-400 to-blue-600',
};

const iconOptions = [
  { value: 'trophy', label: 'Trophy' },
  { value: 'medal', label: 'Medal' },
  { value: 'target', label: 'Target' },
  { value: 'zap', label: 'Lightning' },
  { value: 'heart', label: 'Heart' },
  { value: 'flame', label: 'Flame' },
  { value: 'award', label: 'Award' },
];

const colorOptions = [
  { value: 'bg-gradient-to-r from-blue-400 to-blue-600', label: 'Blue' },
  { value: 'bg-gradient-to-r from-green-400 to-green-600', label: 'Green' },
  { value: 'bg-gradient-to-r from-yellow-400 to-yellow-600', label: 'Gold' },
  { value: 'bg-gradient-to-r from-purple-400 to-purple-600', label: 'Purple' },
  { value: 'bg-gradient-to-r from-red-400 to-red-600', label: 'Red' },
  { value: 'bg-gradient-to-r from-pink-400 to-pink-600', label: 'Pink' },
];

export function BadgeFormModal({ isOpen, onClose, onSubmit, badge }: BadgeFormModalProps) {
  const [formData, setFormData] = useState<Partial<AchievementBadge>>(defaultBadge);

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData(defaultBadge);
    }
  }, [badge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>{badge ? 'Edit Badge' : 'Create New Badge'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Badge Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700"
                placeholder="Enter badge name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700"
                placeholder="Enter badge description"
              />
            </div>

            <div>
              <Label htmlFor="type">Badge Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as AchievementBadge['type'] })}
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue placeholder="Select badge type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="habit">Habit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color Theme</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pointValue">Point Value</Label>
              <Input
                id="pointValue"
                type="number"
                value={formData.pointValue}
                onChange={(e) => setFormData({ ...formData, pointValue: parseInt(e.target.value) })}
                className="bg-gray-700"
                min={0}
                max={1000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {badge ? 'Save Changes' : 'Create Badge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
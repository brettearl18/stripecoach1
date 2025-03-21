'use client';

import { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

// Types
interface GoalTemplate {
  title: string;
  description: string;
  type: GoalType;
  unit: string;
  presets: {
    start: number;
    target: number;
  };
}

interface SocialShare {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  likes: number;
  comments: Comment[];
  date: string;
  achievements?: Achievement[];
}

interface Milestone {
  badge: string;
  value: number;
  achieved: boolean;
  achievedAt?: string;
  points: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  date: string;
  likes: number;
}

interface Achievement {
  type: 'streak' | 'milestone' | 'challenge';
  title: string;
  description: string;
  icon: string;
  color: string;
}

type GoalType = 'weight' | 'strength' | 'cardio' | 'nutrition' | 'wellness';

// Goal Types Configuration
const goalTypes: Record<GoalType, { icon: string; gradient: string }> = {
  weight: {
    icon: '⚖️',
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  strength: {
    icon: '💪',
    gradient: 'bg-gradient-to-r from-red-500 to-red-600'
  },
  cardio: {
    icon: '🏃‍♂️',
    gradient: 'bg-gradient-to-r from-green-500 to-green-600'
  },
  nutrition: {
    icon: '🥗',
    gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  },
  wellness: {
    icon: '🧘‍♂️',
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
  }
};

// Add after the goalTypes constant
const defaultAvatars = {
  male: [
    '/avatars/male-1.png',
    '/avatars/male-2.png',
    '/avatars/male-3.png',
    '/avatars/male-4.png',
  ],
  female: [
    '/avatars/female-1.png',
    '/avatars/female-2.png',
    '/avatars/female-3.png',
    '/avatars/female-4.png',
  ],
  neutral: [
    '/avatars/neutral-1.png',
    '/avatars/neutral-2.png',
    '/avatars/neutral-3.png',
    '/avatars/neutral-4.png',
  ]
};

// Add after the defaultAvatars constant
const achievements: Record<string, Achievement> = {
  '5k-runner': {
    type: 'milestone',
    title: '5K Runner',
    description: 'Completed a 5K run',
    icon: '🏃‍♂️',
    color: 'from-green-500 to-green-600'
  },
  'streak-7': {
    type: 'streak',
    title: '7 Day Streak',
    description: 'Maintained goals for 7 days',
    icon: '🔥',
    color: 'from-orange-500 to-orange-600'
  },
  'strength-master': {
    type: 'milestone',
    title: 'Strength Master',
    description: 'Achieved diamond milestone in strength',
    icon: '💪',
    color: 'from-red-500 to-red-600'
  }
};

// Goal Templates
const goalTemplates: Record<string, GoalTemplate[]> = {
  weight: [
    {
      title: "Healthy Weight Loss",
      description: "Achieve a sustainable weight loss goal through balanced nutrition and exercise",
      type: "weight",
      unit: "kg",
      presets: { start: 80, target: 70 }
    },
    {
      title: "Muscle Building",
      description: "Gain lean muscle mass through progressive overload and proper nutrition",
      type: "weight",
      unit: "kg",
      presets: { start: 70, target: 75 }
    }
  ],
  strength: [
    {
      title: "Bench Press PR",
      description: "Increase your bench press max through structured training",
      type: "strength",
      unit: "kg",
      presets: { start: 60, target: 80 }
    },
    {
      title: "Squat Mastery",
      description: "Build lower body strength with squat progression",
      type: "strength",
      unit: "kg",
      presets: { start: 80, target: 100 }
    }
  ],
  cardio: [
    {
      title: "5K Running",
      description: "Train for your first 5K or improve your current time",
      type: "cardio",
      unit: "min",
      presets: { start: 35, target: 25 }
    },
    {
      title: "Swimming Endurance",
      description: "Build swimming endurance for 1000m continuous swim",
      type: "cardio",
      unit: "min",
      presets: { start: 40, target: 30 }
    }
  ],
  nutrition: [
    {
      title: "Protein Intake",
      description: "Increase daily protein intake for better recovery",
      type: "nutrition",
      unit: "g",
      presets: { start: 80, target: 120 }
    },
    {
      title: "Water Intake",
      description: "Stay hydrated with proper daily water intake",
      type: "nutrition",
      unit: "L",
      presets: { start: 2, target: 3 }
    }
  ],
  wellness: [
    {
      title: "Sleep Quality",
      description: "Improve sleep duration and quality",
      type: "wellness",
      unit: "hrs",
      presets: { start: 6, target: 8 }
    },
    {
      title: "Meditation Practice",
      description: "Build a consistent meditation practice",
      type: "wellness",
      unit: "min",
      presets: { start: 5, target: 20 }
    }
  ]
};

// Update the sampleSocialShares data
const sampleSocialShares: SocialShare[] = [
  {
    id: "1",
    goalId: "goal1",
    userId: "user1",
    userName: "John Doe",
    userAvatar: defaultAvatars.male[0],
    message: "Just hit my diamond milestone for bench press! 💪 Started at 60kg, now at 100kg!",
    likes: 24,
    comments: [
      {
        id: "c1",
        userId: "user2",
        userName: "Sarah Smith",
        userAvatar: defaultAvatars.female[0],
        message: "That's incredible progress! Keep pushing! 💪",
        date: new Date(Date.now() - 3600000).toISOString(),
        likes: 5
      }
    ],
    date: new Date().toISOString(),
    achievements: [achievements['strength-master']]
  },
  {
    id: "2",
    goalId: "goal2",
    userId: "user2",
    userName: "Sarah Smith",
    userAvatar: defaultAvatars.female[0],
    message: "Completed my first 5K under 25 minutes! Thanks for all the support! 🏃‍♀️",
    likes: 18,
    comments: [],
    date: new Date(Date.now() - 86400000).toISOString(),
    achievements: [achievements['5k-runner']]
  },
  {
    id: "3",
    goalId: "goal3",
    userId: "user3",
    userName: "Alex Chen",
    userAvatar: defaultAvatars.neutral[0],
    message: "Hit my protein intake goal for the week! 🥩 120g daily average achieved!",
    likes: 15,
    comments: [],
    date: new Date(Date.now() - 172800000).toISOString(),
    achievements: [achievements['streak-7']]
  }
];

export default function ClientSetup() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [socialShares, setSocialShares] = useState<SocialShare[]>(sampleSocialShares);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newValue, setNewValue] = useState<number | ''>('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const calculateMilestones = (start: number, target: number): Milestone[] => {
    const range = Math.abs(target - start);
    const isIncreasing = target > start;
    const milestones: Milestone[] = [
      {
        badge: 'Bronze',
        value: start + (isIncreasing ? range * 0.25 : -range * 0.25),
        achieved: false,
        points: 100
      },
      {
        badge: 'Silver',
        value: start + (isIncreasing ? range * 0.5 : -range * 0.5),
        achieved: false,
        points: 250
      },
      {
        badge: 'Gold',
        value: start + (isIncreasing ? range * 0.75 : -range * 0.75),
        achieved: false,
        points: 500
      },
      {
        badge: 'Diamond',
        value: target,
        achieved: false,
        points: 1000
      }
    ];
    return milestones;
  };

  const handleApplyTemplate = (template: GoalTemplate) => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: template.title,
      description: template.description,
      type: template.type,
      startValue: template.presets.start,
      currentValue: template.presets.start,
      targetValue: template.presets.target,
      unit: template.unit,
      milestones: calculateMilestones(template.presets.start, template.presets.target),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, newGoal]);
    setShowTemplates(false);
  };

  const handleShareProgress = (goal: Goal) => {
    const newShare: SocialShare = {
      id: Math.random().toString(36).substr(2, 9),
      goalId: goal.id,
      userId: "currentUser",
      userName: "Current User",
      userAvatar: defaultAvatars.neutral[Math.floor(Math.random() * defaultAvatars.neutral.length)],
      message: `Made progress on my ${goal.title} goal! Currently at ${goal.currentValue}${goal.unit} towards ${goal.targetValue}${goal.unit}`,
      likes: 0,
      comments: [],
      date: new Date().toISOString()
    };
    
    setSocialShares(prev => [newShare, ...prev]);
  };

  const handleUpdateProgress = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    setSelectedGoal(goal);
    setNewValue(goal.currentValue);
    setShowUpdateModal(true);
  };

  const handleSaveProgress = () => {
    if (!selectedGoal || newValue === '') return;

    const updatedGoals = goals.map(goal => {
      if (goal.id !== selectedGoal.id) return goal;

      const isIncreasing = goal.targetValue > goal.startValue;
      const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.achieved) return milestone;
        
        const hasAchieved = isIncreasing
          ? Number(newValue) >= milestone.value
          : Number(newValue) <= milestone.value;

        if (hasAchieved) {
          return {
            ...milestone,
            achieved: true,
            achievedAt: new Date().toISOString()
          };
        }
        return milestone;
      });

      // Check if diamond milestone was achieved
      const diamondMilestone = updatedMilestones[updatedMilestones.length - 1];
      if (diamondMilestone.achieved) {
        alert('Congratulations! You\'ve achieved your diamond milestone! 🎉 Time to set a new goal!');
      }

      return {
        ...goal,
        currentValue: Number(newValue),
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString()
      };
    });

    setGoals(updatedGoals);
    setShowUpdateModal(false);
    setSelectedGoal(null);
    setNewValue('');
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    
    setSocialShares(prev => prev.map(share => {
      if (share.id === postId) {
        return {
          ...share,
          likes: likedPosts.has(postId) ? share.likes - 1 : share.likes + 1
        };
      }
      return share;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!newComment[postId]?.trim()) return;
    
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: "currentUser",
      userName: "Current User",
      userAvatar: defaultAvatars.neutral[Math.floor(Math.random() * defaultAvatars.neutral.length)],
      message: newComment[postId],
      date: new Date().toISOString(),
      likes: 0
    };
    
    setSocialShares(prev => prev.map(share => {
      if (share.id === postId) {
        return {
          ...share,
          comments: [...share.comments, comment]
        };
      }
      return share;
    }));
    
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Goal Setup & Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set and track your fitness goals, earn badges, and share your progress with the community.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by category:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === null
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              All
            </button>
            {Object.keys(goalTypes).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals
          .filter(goal => !selectedCategory || goal.type === selectedCategory)
          .map(goal => (
          <div
            key={goal.id}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goal.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                goalTypes[goal.type].gradient
              }`}>
                {goal.type}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Progress</span>
                <span>{goal.currentValue}{goal.unit} / {goal.targetValue}{goal.unit}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${goalTypes[goal.type].gradient}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100))}%`
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {goal.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    milestone.achieved
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    milestone.achieved
                      ? goalTypes[goal.type].gradient
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                  <span>{milestone.badge}</span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {milestone.value}{goal.unit}
                  </span>
                  {milestone.achieved && (
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(milestone.achievedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => handleShareProgress(goal)}
                className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Share Progress
              </button>
              <button
                onClick={() => handleUpdateProgress(goal.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Update Progress
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Social Feed */}
      {socialShares.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Community Updates
          </h2>
          <div className="space-y-4">
            {socialShares.map(share => (
              <div key={share.id} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={share.userAvatar}
                      alt={share.userName}
                      className="h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatars.neutral[0];
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white dark:border-gray-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {share.userName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(share.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {share.achievements && share.achievements.length > 0 && (
                        <div className="flex gap-2">
                          {share.achievements.map((achievement, index) => (
                            <div
                              key={index}
                              className="group relative"
                              title={`${achievement.title}: ${achievement.description}`}
                            >
                              <span className="text-xl">{achievement.icon}</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {achievement.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {share.message}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleLike(share.id)}
                        className={`flex items-center gap-1 transition-colors group ${
                          likedPosts.has(share.id)
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${likedPosts.has(share.id) ? 'fill-current' : 'group-hover:fill-current'}`} />
                        <span className="text-sm">{share.likes}</span>
                      </button>
                      <button
                        onClick={() => handleToggleComments(share.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4 group-hover:fill-current" />
                        <span className="text-sm">{share.comments.length}</span>
                      </button>
                    </div>
                    
                    {/* Comments Section */}
                    {expandedComments.has(share.id) && (
                      <div className="mt-4 space-y-4">
                        {share.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="h-8 w-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.date).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {comment.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <button className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                  Like
                                </button>
                                <span className="text-xs text-gray-400">·</span>
                                <button className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Comment */}
                        <div className="flex gap-3">
                          <img
                            src={defaultAvatars.neutral[0]}
                            alt="Your avatar"
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={newComment[share.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [share.id]: e.target.value }))}
                              placeholder="Write a comment..."
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleAddComment(share.id)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Goal Button */}
      <button
        onClick={() => setShowTemplates(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goal Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(goalTemplates).map(([category, templates]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 capitalize">
                    {category} Goals
                  </h3>
                  <div className="space-y-4">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyTemplate(template)}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <span>Start: {template.presets.start}{template.unit}</span>
                          <span>→</span>
                          <span>Target: {template.presets.target}{template.unit}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Progress</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedGoal(null);
                  setNewValue('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Value ({selectedGoal.unit})
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter new value in ${selectedGoal.unit}`}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedGoal(null);
                    setNewValue('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgress}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
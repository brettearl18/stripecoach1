'use client';

import {
  ArrowTrendingUpIcon,
  PhotoIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface TabContentProps {
  client: any;
}

export default function ProgressTab({ client }: TabContentProps) {
  // Filter out metrics we don't want to show in the progress view
  const relevantMetrics = Object.entries(client.metrics || {}).filter(
    ([key]) => !['streak', 'completionRate', 'lastCheckIn'].includes(key)
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Progress Charts */}
      <div className="col-span-2 space-y-6">
        {/* Goals Progress */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Goals Progress</h2>
            <div className="space-y-6">
              {client.goals?.map((goal: any) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{goal.title}</span>
                    <span className="text-sm text-gray-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Progress */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Progress Overview</h2>
            <div className="space-y-8">
              {relevantMetrics.map(([metric, value]) => (
                <div key={metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white capitalize">{metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {value}
                        {metric === 'weight' ? ' kg' : metric === 'sleep' ? ' hrs' : '%'}
                      </span>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric === 'weight' ? 'bg-green-500' :
                        metric === 'energy' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}
                      style={{
                        width: `${value}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Progress Photos & Achievements */}
      <div className="space-y-6">
        {/* Progress Photos */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Progress Photos</h2>
              <button
                onClick={() => {/* TODO: Implement photo upload */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Upload New Photos
              </button>
            </div>

            {/* Upload Area */}
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-300"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Achievements</h2>
            <div className="space-y-4">
              {[
                { icon: TrophyIcon, color: 'text-yellow-400', text: 'Completed 4-week program' },
                { icon: FireIcon, color: 'text-red-400', text: '7-day streak maintained' },
                { icon: SparklesIcon, color: 'text-blue-400', text: 'Hit weight goal milestone' }
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                  <span className="text-sm text-white">{achievement.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
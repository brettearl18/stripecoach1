'use client';

import {
  PlusIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  HeartIcon,
  BoltIcon,
  TrophyIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface TabContentProps {
  client: any;
}

export default function FormsTab({ client }: TabContentProps) {
  return (
    <div className="space-y-6">
      {/* Active Forms */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Active Forms</h2>
            <button
              onClick={() => {/* TODO: Implement new form */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Assign New Form
            </button>
          </div>
          <div className="space-y-4">
            {client.forms?.filter((form: any) => form.status === 'pending').map((form: any) => (
              <div key={form.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">{form.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1.5" />
                      Due by {new Date(form.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800/20">
                    Pending
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end space-x-4">
                  <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                    View Form
                  </button>
                  <button className="text-sm font-medium text-red-400 hover:text-red-300">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completed Forms */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Completed Forms</h2>
          <div className="space-y-4">
            {client.forms?.filter((form: any) => form.status === 'completed').map((form: any) => (
              <div key={form.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">{form.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1.5" />
                      Completed on {new Date(form.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800/20">
                    Completed
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                    View Responses
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Templates */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Available Templates</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Initial Assessment', icon: ClipboardDocumentListIcon },
              { title: 'Monthly Progress Review', icon: ChartBarIcon },
              { title: 'Nutrition Questionnaire', icon: HeartIcon },
              { title: 'Workout Feedback', icon: BoltIcon },
              { title: 'Goal Setting', icon: TrophyIcon },
              { title: 'Mindset Check-in', icon: SparklesIcon }
            ].map((template, index) => (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <template.icon className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-white text-center">
                  {template.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
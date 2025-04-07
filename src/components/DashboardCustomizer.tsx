'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import {
  ViewColumnsIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

interface DashboardSection {
  id: string;
  title: string;
  isVisible: boolean;
  order: number;
  columnSpan: 1 | 2 | 3;
}

interface DashboardPreferences {
  sections: DashboardSection[];
}

const defaultSections: DashboardSection[] = [
  { id: 'quick-stats', title: 'Quick Stats', isVisible: true, order: 0, columnSpan: 3 },
  { id: 'client-progress', title: 'Client Progress', isVisible: true, order: 1, columnSpan: 2 },
  { id: 'client-of-week', title: 'Client of the Week', isVisible: true, order: 2, columnSpan: 1 },
  { id: 'priority-actions', title: 'Priority Actions', isVisible: true, order: 3, columnSpan: 1 },
  { id: 'upcoming-checkins', title: 'Upcoming Check-ins', isVisible: true, order: 4, columnSpan: 1 },
  { id: 'progress-photos', title: 'Progress Photos', isVisible: true, order: 5, columnSpan: 1 },
  { id: 'ai-insights', title: 'AI Insights', isVisible: true, order: 6, columnSpan: 3 },
];

export function DashboardCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<DashboardSection[]>(defaultSections);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        if (Array.isArray(parsed)) {
          setSections(parsed);
        }
      } catch (e) {
        console.error('Failed to parse dashboard preferences:', e);
      }
    }
  }, []);

  const savePreferences = (updatedSections: DashboardSection[]) => {
    setSections(updatedSections);
    localStorage.setItem('dashboardPreferences', JSON.stringify(updatedSections));
    window.dispatchEvent(new CustomEvent('dashboardPreferencesUpdated', {
      detail: { sections: updatedSections }
    }));
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, isVisible: !section.isVisible }
        : section
    );
    savePreferences(updatedSections);
  };

  const updateColumnSpan = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        // Cycle through column spans: 1 -> 2 -> 3 -> 1
        const newSpan = section.columnSpan === 3 ? 1 : (section.columnSpan + 1) as 1 | 2 | 3;
        return { ...section, columnSpan: newSpan };
      }
      return section;
    });
    savePreferences(updatedSections);
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;

    const updatedSections = [...sections];
    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    const [draggedItem] = updatedSections.splice(draggedIndex, 1);
    updatedSections.splice(targetIndex, 0, draggedItem);

    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }));

    savePreferences(reorderedSections);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
      >
        <ViewColumnsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customize Dashboard
            </h3>
            <div className="space-y-3">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(section.id)}
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-move ${
                    draggedSection === section.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateColumnSpan(section.id)}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      {section.columnSpan}/3
                    </button>
                    <Switch
                      checked={section.isVisible}
                      onChange={() => toggleSectionVisibility(section.id)}
                      className={`${
                        section.isVisible ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    >
                      <span className="sr-only">Toggle {section.title}</span>
                      <span
                        className={`${
                          section.isVisible ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
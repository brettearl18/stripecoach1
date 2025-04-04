'use client';

import { useState } from 'react';

export default function AdminProgramsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Programs</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage coaching programs and templates</p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Active Programs</h2>
          <div className="space-y-4">
            {/* Placeholder for programs list */}
            <p className="text-gray-500 dark:text-gray-400">No programs to display</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
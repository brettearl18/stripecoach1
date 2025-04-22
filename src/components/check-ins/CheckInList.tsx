'use client';

import { useState, useMemo } from 'react';
import { CheckIn } from '@/lib/services/firebaseService';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';

interface CheckInListProps {
  checkIns: CheckIn[];
  loading: boolean;
  onUpdate: (id: string, updates: Partial<CheckIn>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type SortField = 'date' | 'weight' | 'mood';
type SortOrder = 'asc' | 'desc';

export const CheckInList = ({ checkIns, loading, onUpdate, onDelete }: CheckInListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [moodFilter, setMoodFilter] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredAndSortedCheckIns = useMemo(() => {
    let filtered = [...checkIns];

    // Apply search filter
    if (debouncedSearch) {
      filtered = filtered.filter(checkIn => 
        checkIn.notes?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        checkIn.mood?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(checkIn => {
        const checkInDate = new Date(checkIn.date);
        if (dateRange.start && checkInDate < dateRange.start) return false;
        if (dateRange.end && checkInDate > dateRange.end) return false;
        return true;
      });
    }

    // Apply mood filter
    if (moodFilter.length > 0) {
      filtered = filtered.filter(checkIn => 
        moodFilter.includes(checkIn.mood?.toLowerCase() || '')
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'weight':
          comparison = (a.weight || 0) - (b.weight || 0);
          break;
        case 'mood':
          comparison = (a.mood || '').localeCompare(b.mood || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [checkIns, debouncedSearch, dateRange, moodFilter, sortField, sortOrder]);

  if (loading) {
    return <div className="flex justify-center p-4">Loading check-ins...</div>;
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleMoodFilter = (mood: string) => {
    setMoodFilter(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search check-ins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange(prev => ({ 
                ...prev, 
                start: e.target.value ? new Date(e.target.value) : null 
              }))}
              className="px-2 py-1 border rounded"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label>To:</label>
            <input
              type="date"
              value={dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange(prev => ({ 
                ...prev, 
                end: e.target.value ? new Date(e.target.value) : null 
              }))}
              className="px-2 py-1 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Mood Filters */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow">
        {['great', 'good', 'okay', 'bad'].map(mood => (
          <button
            key={mood}
            onClick={() => toggleMoodFilter(mood)}
            className={`px-3 py-1 rounded-full ${
              moodFilter.includes(mood)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Check-ins List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th 
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('weight')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Weight {sortField === 'weight' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('mood')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Mood {sortField === 'mood' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedCheckIns.map(checkIn => (
              <tr key={checkIn.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(checkIn.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {checkIn.weight ? `${checkIn.weight} kg` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      checkIn.mood === 'great' ? 'bg-green-100 text-green-800' :
                      checkIn.mood === 'good' ? 'bg-blue-100 text-blue-800' :
                      checkIn.mood === 'okay' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {checkIn.mood}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 truncate max-w-xs">
                    {checkIn.notes || '-'}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(checkIn.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedCheckIns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No check-ins found matching your filters.
        </div>
      )}
    </div>
  );
}; 
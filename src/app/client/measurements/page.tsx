'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import {
  ChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

type Measurement = {
  id: string;
  date: string;
  measurements: {
    weight: number;
    chest: number;
    waist: number;
    hips: number;
    thighs: number;
    arms: number;
    shoulders: number;
    calves: number;
    bodyFat?: number;
    height?: number;
  };
  notes?: string;
};

// Sample data - would come from backend
const sampleMeasurements: Measurement[] = [
  {
    id: '1',
    date: '2024-03-15',
    measurements: {
      weight: 75.5,
      chest: 95,
      waist: 80,
      hips: 100,
      thighs: 55,
      arms: 35,
      shoulders: 110,
      calves: 38,
    },
    notes: 'Initial measurements'
  },
  {
    id: '2',
    date: '2024-03-08',
    measurements: {
      weight: 76.2,
      chest: 96,
      waist: 81,
      hips: 101,
      thighs: 56,
      arms: 34,
      shoulders: 111,
      calves: 38,
    },
    notes: 'Week 1 measurements'
  }
];

// Test data - Replace with actual data from your backend
const measurementData = {
  dates: ['Jan 1', 'Jan 15', 'Feb 1', 'Feb 15', 'Mar 1', 'Mar 15', 'Apr 1'],
  measurements: {
    weight: [85.5, 84.8, 83.2, 82.5, 81.8, 80.5, 79.2], // in kg
    chest: [42, 41.5, 41, 40.8, 40.5, 40.2, 40],
    waist: [36, 35.5, 35, 34.8, 34.5, 34.2, 34],
    hips: [40, 39.8, 39.5, 39.2, 39, 38.8, 38.5],
    biceps: [15, 15.2, 15.4, 15.6, 15.8, 16, 16.2],
    thighs: [24, 23.8, 23.5, 23.2, 23, 22.8, 22.5]
  }
};

const measurementColors = {
  weight: 'rgb(34, 197, 94)', // emerald-500
  chest: 'rgb(244, 63, 94)', // rose-500
  waist: 'rgb(59, 130, 246)', // blue-500
  hips: 'rgb(14, 165, 233)', // sky-500
  biceps: 'rgb(168, 85, 247)', // purple-500
  thighs: 'rgb(249, 115, 22)' // orange-500
};

const measurementGradients = {
  weight: 'from-emerald-500/20 to-emerald-500/0',
  chest: 'from-rose-500/20 to-rose-500/0',
  waist: 'from-blue-500/20 to-blue-500/0',
  hips: 'from-sky-500/20 to-sky-500/0',
  biceps: 'from-purple-500/20 to-purple-500/0',
  thighs: 'from-orange-500/20 to-orange-500/0'
};

// Add BMI calculation function
const calculateBMI = (weight: number, height: number) => {
  const bmi = weight / ((height / 100) * (height / 100));
  return {
    value: bmi.toFixed(1),
    category: bmi < 18.5 ? 'Underweight' :
             bmi < 25 ? 'Normal weight' :
             bmi < 30 ? 'Overweight' : 'Obese',
    color: bmi < 18.5 ? 'text-blue-500' :
           bmi < 25 ? 'text-green-500' :
           bmi < 30 ? 'text-yellow-500' : 'text-red-500'
  };
};

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>(sampleMeasurements);
  const [isAdding, setIsAdding] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Measurement['measurements']>({
    weight: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    thighs: 0,
    arms: 0,
    shoulders: 0,
    calves: 0,
  });
  const [notes, setNotes] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [height, setHeight] = useState(175); // Default height in cm

  // Calculate BMI from latest weight
  const latestWeight = measurementData.measurements.weight[measurementData.measurements.weight.length - 1];
  const bmi = calculateBMI(latestWeight, height);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const measurement: Measurement = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      measurements: newMeasurement,
      notes: notes || undefined,
    };

    setMeasurements(prev => [measurement, ...prev]);
    setIsAdding(false);
    setNewMeasurement({
      weight: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      thighs: 0,
      arms: 0,
      shoulders: 0,
      calves: 0,
    });
    setNotes('');
  };

  const getChange = (current: number, previous: number): { value: number; type: 'increase' | 'decrease' | 'same' } => {
    const diff = current - previous;
    return {
      value: Math.abs(diff),
      type: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'same',
    };
  };

  const measurementFields = [
    { key: 'weight' as const, label: 'Weight (kg)' },
    { key: 'chest' as const, label: 'Chest (cm)' },
    { key: 'waist' as const, label: 'Waist (cm)' },
    { key: 'hips' as const, label: 'Hips (cm)' },
    { key: 'thighs' as const, label: 'Thighs (cm)' },
    { key: 'arms' as const, label: 'Arms (cm)' },
    { key: 'shoulders' as const, label: 'Shoulders (cm)' },
    { key: 'calves' as const, label: 'Calves (cm)' },
  ];

  const getChartData = (measurement: string | 'all') => {
    if (measurement === 'all') {
      return {
        labels: measurementData.dates,
        datasets: Object.entries(measurementData.measurements).map(([key, values]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          data: values,
          borderColor: measurementColors[key as keyof typeof measurementColors],
          backgroundColor: `${measurementColors[key as keyof typeof measurementColors]}20`,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'white',
          pointHoverBackgroundColor: measurementColors[key as keyof typeof measurementColors],
          pointBorderColor: measurementColors[key as keyof typeof measurementColors],
          pointBorderWidth: 2,
          yAxisID: key === 'weight' ? 'y1' : 'y'
        }))
      };
    }

    return {
      labels: measurementData.dates,
      datasets: [{
        label: measurement.charAt(0).toUpperCase() + measurement.slice(1),
        data: measurementData.measurements[measurement as keyof typeof measurementData.measurements],
        borderColor: measurementColors[measurement as keyof typeof measurementColors],
        backgroundColor: `${measurementColors[measurement as keyof typeof measurementColors]}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'white',
        pointHoverBackgroundColor: measurementColors[measurement as keyof typeof measurementColors],
        pointBorderColor: measurementColors[measurement as keyof typeof measurementColors],
        pointBorderWidth: 2,
        yAxisID: measurement === 'weight' ? 'y1' : 'y'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Body Measurements Progress',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        padding: { bottom: 30 }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        boxWidth: 8,
        boxHeight: 8,
        caretSize: 6,
      }
    },
    scales: {
      y: {
        position: 'left',
        beginAtZero: false,
        grid: {
          color: '#e5e7eb40',
        },
        border: {
          dash: [4, 4],
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 8
        },
        title: {
          display: true,
          text: 'Inches',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          padding: { top: 8, bottom: 8 }
        }
      },
      y1: {
        position: 'right',
        beginAtZero: false,
        grid: {
          drawOnChartArea: false,
        },
        border: {
          dash: [4, 4],
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 8
        },
        title: {
          display: true,
          text: 'Weight (kg)',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          padding: { top: 8, bottom: 8 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 8
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header with BMI */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Body Measurements Tracker
              </h1>
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">BMI</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${bmi.color}`}>{bmi.value}</span>
                    <span className="text-sm text-gray-500">{bmi.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Measurement</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedMeasurement('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedMeasurement === 'all'
                    ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All Measurements
              </button>
              {Object.entries(measurementData.measurements).map(([key]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMeasurement(key)}
                  className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedMeasurement === key
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedMeasurement === key ? measurementColors[key as keyof typeof measurementColors] : ''
                  }}
                >
                  <span className="relative z-10">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  {selectedMeasurement !== key && (
                    <span
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                      style={{
                        backgroundColor: measurementColors[key as keyof typeof measurementColors]
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[600px] p-4">
            <Line data={getChartData(selectedMeasurement)} options={chartOptions} className="!w-full !h-full" />
          </div>

          {/* Latest Measurements Table */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Latest Measurements
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Measurement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(measurementData.measurements).map(([key, values]) => {
                    const current = values[values.length - 1];
                    const previous = values[values.length - 2];
                    const change = current - previous;
                    return (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {current}"
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {previous}"
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}"
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Measurement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Measurement</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {measurementFields.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMeasurement[key]}
                      onChange={(e) => setNewMeasurement(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Body Fat % (optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
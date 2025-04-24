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
  XMarkIcon,
  TrophyIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  PhotoIcon,
  ChartPieIcon,
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

// Add new type for form data
type MeasurementFormData = {
  date: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  biceps: string;
  thighs: string;
  notes?: string;
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
  const [selectedMetric, setSelectedMetric] = useState<Measurement>('weight');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [formData, setFormData] = useState<MeasurementFormData>({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: '',
  });

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
    setShowAddModal(false);
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

  const handleInputChange = (field: keyof MeasurementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const individualChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        color: '#fff',
        font: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        padding: { bottom: 15 }
      },
      tooltip: {
        backgroundColor: '#374151',
        titleColor: '#fff',
        bodyColor: '#fff',
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        titleFont: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        borderColor: '#4B5563',
        borderWidth: 1,
        boxWidth: 8,
        boxHeight: 8,
        caretSize: 5,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
            family: "'Inter', sans-serif"
          },
          padding: 8,
          maxTicksLimit: 5
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
            family: "'Inter', sans-serif"
          },
          padding: 4,
          maxTicksLimit: 4
        }
      }
    }
  };

  const getIndividualChartData = (measurement: keyof typeof measurementData.measurements) => {
    return {
      labels: measurementData.dates,
      datasets: [{
        label: measurement.charAt(0).toUpperCase() + measurement.slice(1),
        data: measurementData.measurements[measurement],
        borderColor: measurementColors[measurement],
        backgroundColor: `${measurementColors[measurement]}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'white',
        pointHoverBackgroundColor: measurementColors[measurement],
        pointBorderColor: measurementColors[measurement],
        pointBorderWidth: 2
      }]
    };
  };

  // Calculate trends and insights
  const calculateTrends = () => {
    const trends = Object.entries(measurementData.measurements).map(([key, values]) => {
      const last4Values = values.slice(-4);
      const trend = last4Values.every((val, i) => i === 0 || val <= last4Values[i - 1]);
      const percentChange = ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1);
      
      return {
        measurement: key,
        trend: trend ? 'decreasing' : 'increasing',
        percentChange: percentChange,
        recentChange: (values[values.length - 1] - values[values.length - 2]).toFixed(1),
        consistency: calculateConsistency(values)
      };
    });

    return trends;
  };

  const calculateConsistency = (values: number[]) => {
    let consistent = 0;
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - values[i-1]) <= 0.5) consistent++;
    }
    return (consistent / (values.length - 1) * 100).toFixed(0);
  };

  const trends = calculateTrends();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Body Measurements Tracker</h1>
            <p className="text-gray-400 mt-1">Track and monitor your body measurements progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
              <button
                onClick={() => setUnit('metric')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  unit === 'metric'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  unit === 'imperial'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Imperial
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Measurement
            </button>
          </div>
        </div>

        {/* Progress Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trends.map((trend) => (
            <div key={trend.measurement} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {trend.trend === 'decreasing' ? (
                    <ArrowTrendingDownIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-400" />
                  )}
                  <h3 className="text-sm font-medium text-white">{trend.measurement.charAt(0).toUpperCase() + trend.measurement.slice(1)}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <TrophyIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">{trend.consistency}% consistent</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-white">
                  {trend.percentChange}%
                </div>
                <p className="text-sm text-gray-400">Total change</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <PhotoIcon className="h-5 w-5" />
            Compare with Photos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <ChartPieIcon className="h-5 w-5" />
            View Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <CalendarIcon className="h-5 w-5" />
            Set Measurement Schedule
          </button>
        </div>

        {/* Measurement Graphs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.keys(measurementData.measurements).map((measurement) => {
            const data = measurementData.measurements[measurement as keyof typeof measurementData.measurements];
            const current = data[data.length - 1];
            const previous = data[data.length - 2];
            const change = current - previous;
            const changeColor = change < 0 ? 'text-green-400' : 'text-red-400';
            const trend = trends.find(t => t.measurement === measurement);

            return (
              <div key={measurement} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <ChartBarIcon className="h-5 w-5" style={{ color: measurementColors[measurement as keyof typeof measurementColors] }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{measurement.charAt(0).toUpperCase() + measurement.slice(1)}</h3>
                      <p className="text-sm text-gray-400">
                        {trend?.trend === 'decreasing' ? 'Trending down' : 'Trending up'}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${changeColor}`}>
                    {change < 0 ? (
                      <ArrowDownIcon className="h-4 w-4" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(change).toFixed(1)} {unit === 'metric' ? (measurement === 'weight' ? 'kg' : 'cm') : (measurement === 'weight' ? 'lbs' : '"')}
                    </span>
                  </div>
                </div>

                <div className="h-[200px] mb-4">
                  <Line
                    data={getIndividualChartData(measurement as keyof typeof measurementData.measurements)}
                    options={{
                      ...individualChartOptions,
                      plugins: {
                        ...individualChartOptions.plugins,
                        title: {
                          ...individualChartOptions.plugins.title,
                          text: `${measurement.charAt(0).toUpperCase() + measurement.slice(1)} Progress`
                        }
                      }
                    }}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current</p>
                    <p className="text-2xl font-bold text-white">
                      {unit === 'metric' 
                        ? `${current.toFixed(1)}${measurement === 'weight' ? ' kg' : ' cm'}`
                        : `${(measurement === 'weight' ? current * 2.20462 : current * 0.393701).toFixed(1)}${measurement === 'weight' ? ' lbs' : '"'}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Target</p>
                    <p className="text-lg font-medium text-gray-300">
                      {unit === 'metric'
                        ? `${(data[0] * 0.9).toFixed(1)}${measurement === 'weight' ? ' kg' : ' cm'}`
                        : `${(measurement === 'weight' ? data[0] * 2.20462 * 0.9 : data[0] * 0.393701 * 0.9).toFixed(1)}${measurement === 'weight' ? ' lbs' : '"'}`
                      }
                    </p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Change</p>
                      <p className="text-lg font-semibold text-white">{trend?.percentChange}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Consistency</p>
                      <p className="text-lg font-semibold text-white">{trend?.consistency}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Measurement Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Add New Measurement</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Chest ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      onChange={(e) => handleInputChange('chest', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Waist ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => handleInputChange('waist', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Hips ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.hips}
                      onChange={(e) => handleInputChange('hips', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Biceps ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.biceps}
                      onChange={(e) => handleInputChange('biceps', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Thighs ({unit === 'metric' ? 'cm' : 'inches'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.thighs}
                      onChange={(e) => handleInputChange('thighs', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    rows={3}
                    placeholder="Add any notes about your measurements..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Measurement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
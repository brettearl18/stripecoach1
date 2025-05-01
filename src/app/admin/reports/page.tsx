'use client';

import { useState } from 'react';
import {
  DocumentChartBarIcon,
  UserGroupIcon,
  ScaleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  XMarkIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for charts
const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Progress',
      data: [65, 72, 68, 75, 82, 88],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    },
  ],
};

const reportCategories = [
  {
    id: 'client-progress',
    title: 'Client Progress Reports',
    description: 'Track weight changes, measurements, and overall progress metrics',
    icon: ChartBarIcon,
    reports: [
      'Weight Loss Trends',
      'Measurement Changes',
      'Progress Photos Analysis',
      'Goal Achievement Rates'
    ]
  },
  {
    id: 'coach-performance',
    title: 'Coach Performance',
    description: 'Analyze coach effectiveness and client satisfaction metrics',
    icon: UserGroupIcon,
    reports: [
      'Client Retention Rates',
      'Client Success Metrics',
      'Response Time Analytics',
      'Client Satisfaction Scores'
    ]
  },
  {
    id: 'compliance',
    title: 'Program Compliance',
    description: 'Monitor check-in completion rates and program adherence',
    icon: CheckCircleIcon,
    reports: [
      'Check-in Completion Rates',
      'Program Adherence Stats',
      'Engagement Metrics',
      'Missed Check-ins Analysis'
    ]
  },
  {
    id: 'time-analytics',
    title: 'Time-Based Analytics',
    description: 'View trends and patterns over different time periods',
    icon: ClockIcon,
    reports: [
      'Weekly Progress Trends',
      'Monthly Success Rates',
      'Peak Activity Times',
      'Seasonal Patterns'
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition Analytics',
    description: 'Analyze dietary compliance and nutrition trends',
    icon: ScaleIcon,
    reports: [
      'Macro Compliance Trends',
      'Meal Plan Adherence',
      'Dietary Restriction Analysis',
      'Supplement Usage Stats'
    ]
  },
  {
    id: 'business',
    title: 'Business Metrics',
    description: 'Track financial and operational performance indicators',
    icon: DocumentChartBarIcon,
    reports: [
      'Revenue Analytics',
      'Client Acquisition Costs',
      'Churn Rate Analysis',
      'Program Popularity Stats'
    ]
  }
];

interface DateRange {
  start: string;
  end: string;
}

interface PreviewData {
  category: string;
  report: string;
  chartData?: any;
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    end: new Date().toISOString().split('T')[0],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (category: string, report: string) => {
    setIsGenerating(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Generate CSV data
      const csvContent = "data:text/csv;charset=utf-8,Date,Value\n" +
        mockChartData.labels.map((label, i) => 
          `${label},${mockChartData.datasets[0].data[i]}`
        ).join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${report.toLowerCase().replace(/\s+/g, '-')}-${dateRange.start}-${dateRange.end}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (category: string, report: string) => {
    setPreviewData({ category, report, chartData: mockChartData });
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-gray-400">Generate and analyze comprehensive system reports</p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Date Range:</span>
            </div>
            <div className="flex gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCategories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <category.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-400">{category.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.reports.map((report) => (
                  <div
                    key={report}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm text-gray-300">{report}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(category.id, report);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateReport(category.id, report);
                        }}
                        disabled={isGenerating}
                        className={`p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors ${
                          isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">{previewData.report}</h3>
                  <p className="text-sm text-gray-400">{dateRange.start} to {dateRange.end}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <Line
                  data={previewData.chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          color: 'rgb(156, 163, 175)'
                        }
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        grid: {
                          color: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleGenerateReport(previewData.category, previewData.report)}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{isGenerating ? 'Generating...' : 'Download Report'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
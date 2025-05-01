import { useEffect, useRef, useState, useMemo } from 'react';
import { DailyMetrics, ProgressUpdate, CheckInHistory } from '@/types/checkIn';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressChartsProps {
  metrics: DailyMetrics[];
  progress: ProgressUpdate[];
  history?: CheckInHistory;
}

type ComparisonPeriod = 'week' | 'month' | 'quarter' | 'year';

export const ProgressCharts = ({ metrics, progress, history }: ProgressChartsProps) => {
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('week');

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (comparisonPeriod) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      metrics: metrics.filter(m => new Date(m.date) >= periodStart),
      progress: progress.filter(p => new Date(p.date) >= periodStart)
    };
  }, [metrics, progress, comparisonPeriod]);

  // Calculate trend data
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 'stable';
    const first = data[0];
    const last = data[data.length - 1];
    const change = ((last - first) / first) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  // Enhanced metrics data with trend analysis
  const metricsData: ChartData<'line'> = {
    labels: filteredData.metrics.map(m => new Date(m.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight',
        data: filteredData.metrics.map(m => m.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Sleep (hours)',
        data: filteredData.metrics.map(m => m.sleep),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Energy Level',
        data: filteredData.metrics.map(m => m.energy),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Mood',
        data: filteredData.metrics.map(m => m.mood),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Enhanced goals data with historical comparison
  const goalsData: ChartData<'bar'> = {
    labels: ['Not Started', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Current Period',
        data: [
          filteredData.progress.filter(p => p.goals.some(g => g.status === 'not-started')).length,
          filteredData.progress.filter(p => p.goals.some(g => g.status === 'in-progress')).length,
          filteredData.progress.filter(p => p.goals.some(g => g.status === 'completed')).length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
      ...(history ? [{
        label: 'Previous Period',
        data: [
          history.lastFiveCheckIns[0]?.metrics.training || 0,
          history.lastFiveCheckIns[0]?.metrics.nutrition || 0,
          history.lastFiveCheckIns[0]?.metrics.mindset || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
      }] : []),
    ],
  };

  // Enhanced achievements data with trend analysis
  const achievementsData: ChartData<'bar'> = {
    labels: filteredData.progress.map(p => new Date(p.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Achievements',
        data: filteredData.progress.map(p => p.achievements.length),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      ...(history ? [{
        label: 'Previous Period',
        data: history.lastFiveCheckIns.map(checkIn => checkIn.overallScore),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }] : []),
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Progress Over Time (${comparisonPeriod})`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  return (
    <div className="space-y-8">
      {/* Period Selection */}
      <div className="flex justify-end space-x-2">
        {(['week', 'month', 'quarter', 'year'] as ComparisonPeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setComparisonPeriod(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              comparisonPeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Metrics</h3>
        <div className="h-80">
          <Line data={metricsData} options={chartOptions} />
        </div>
        {history?.trends && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.trends.map((trend) => (
              <div key={trend.metric} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{trend.metric}</div>
                <div className="flex items-center mt-1">
                  <span className={`text-lg font-medium ${
                    trend.trend === 'up' ? 'text-green-600' :
                    trend.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'}
                  </span>
                  <span className="ml-1 text-lg font-medium">
                    {trend.weeklyAverage.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  vs {trend.monthlyAverage.toFixed(1)} monthly
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals Status Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Goals Status</h3>
        <div className="h-80">
          <Bar data={goalsData} options={chartOptions} />
        </div>
      </div>

      {/* Achievements Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements Over Time</h3>
        <div className="h-80">
          <Bar data={achievementsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}; 
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, description }: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <div className="mt-2 flex items-center">
            <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="ml-2 text-sm text-gray-500">vs last month</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    )}
  </div>
);

export default function DashboardMetricsGrid() {
  const metrics = [
    {
      title: 'Total Active Clients',
      value: '1,234',
      icon: UserGroupIcon,
      trend: { value: 12, isPositive: true },
      description: 'Across all coaches'
    },
    {
      title: 'Average Completion Rate',
      value: '92%',
      icon: ChartBarIcon,
      trend: { value: 5, isPositive: true },
      description: 'Program completion rate'
    },
    {
      title: 'Active Alerts',
      value: '23',
      icon: BellAlertIcon,
      trend: { value: 8, isPositive: false },
      description: 'Requiring attention'
    },
    {
      title: 'Client Success Rate',
      value: '87%',
      icon: TrophyIcon,
      trend: { value: 3, isPositive: true },
      description: 'Achieved goals'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
} 
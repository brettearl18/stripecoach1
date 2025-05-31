import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { useAIService } from '@/hooks/useAIService';

interface MetricCardProps {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  change,
  tooltip
}) => {
  const TrendIcon = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    stable: TrendingFlatIcon
  }[trend];

  const trendColor = {
    up: 'success.main',
    down: 'error.main',
    stable: 'info.main'
  }[trend];

  return (
    <Card>
      <CardContent>
        <Tooltip title={tooltip || ''}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
        </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="div" sx={{ mr: 1 }}>
            {value}%
          </Typography>
          <TrendIcon sx={{ color: trendColor }} />
          <Typography
            variant="body2"
            sx={{ color: trendColor, ml: 0.5 }}
          >
            {change}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: trendColor,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export const PerformanceMetrics: React.FC = () => {
  const {
    data: metrics,
    isLoading,
    error,
    execute
  } = useAIService<{
    clientEngagement: number;
    programCompletion: number;
    clientSatisfaction: number;
    progressRate: number;
  }>();

  React.useEffect(() => {
    execute('performance-metrics', async () => {
      const response = await fetch('/api/ai/analysis/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    });
  }, [execute]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading metrics: {error}
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Client Engagement"
          value={metrics?.clientEngagement || 0}
          trend="up"
          change={5}
          tooltip="Percentage of clients actively engaging with the platform"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Program Completion"
          value={metrics?.programCompletion || 0}
          trend="up"
          change={3}
          tooltip="Rate of program completion among clients"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Client Satisfaction"
          value={metrics?.clientSatisfaction || 0}
          trend="stable"
          change={0}
          tooltip="Overall client satisfaction score"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Progress Rate"
          value={metrics?.progressRate || 0}
          trend="up"
          change={7}
          tooltip="Average rate of client progress"
        />
      </Grid>
    </Grid>
  );
}; 
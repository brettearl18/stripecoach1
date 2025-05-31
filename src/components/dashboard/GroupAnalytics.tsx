import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAIService } from '@/hooks/useAIService';

interface GroupMetric {
  category: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface GroupAnalyticsData {
  metrics: GroupMetric[];
  commonChallenges: string[];
  recentWins: string[];
  focusAreas: string[];
}

export const GroupAnalytics: React.FC = () => {
  const {
    data: analytics,
    isLoading,
    error,
    execute
  } = useAIService<GroupAnalyticsData>();

  React.useEffect(() => {
    execute('group-analytics', async () => {
      const response = await fetch('/api/ai/analysis/group');
      if (!response.ok) throw new Error('Failed to fetch group analytics');
      return response.json();
    });
  }, [execute]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading group analytics: {error}
      </Typography>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Group Analytics"
        subheader="AI-generated insights about your client group"
      />
      <CardContent>
        <Box sx={{ height: 300, mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics?.metrics}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Common Challenges
          </Typography>
          {analytics?.commonChallenges.map((challenge, index) => (
            <Typography
              key={index}
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              • {challenge}
            </Typography>
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Wins
          </Typography>
          {analytics?.recentWins.map((win, index) => (
            <Typography
              key={index}
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              • {win}
            </Typography>
          ))}
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Focus Areas
          </Typography>
          {analytics?.focusAreas.map((area, index) => (
            <Typography
              key={index}
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              • {area}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAIService } from '@/hooks/useAIService';

interface Insight {
  type: 'success' | 'warning' | 'error';
  message: string;
  impact: 'high' | 'medium' | 'low';
}

interface ClientInsight {
  clientId: string;
  clientName: string;
  insights: Insight[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
}

export const ClientInsights: React.FC = () => {
  const {
    data: insights,
    isLoading,
    error,
    execute
  } = useAIService<ClientInsight[]>();

  React.useEffect(() => {
    execute('client-insights', async () => {
      const response = await fetch('/api/ai/analysis/client-insights');
      if (!response.ok) throw new Error('Failed to fetch client insights');
      return response.json();
    });
  }, [execute]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading client insights: {error}
      </Typography>
    );
  }

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
    }
  };

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  return (
    <Card>
      <CardHeader
        title="Client Insights"
        subheader="AI-generated insights about your clients"
      />
      <CardContent>
        <List>
          {insights?.map((client) => (
            <ListItem
              key={client.clientId}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}
            >
              <Box sx={{ width: '100%', mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {client.clientName}
                </Typography>
                <Chip
                  label={client.overallSentiment}
                  color={
                    client.overallSentiment === 'positive'
                      ? 'success'
                      : client.overallSentiment === 'negative'
                      ? 'error'
                      : 'default'
                  }
                  size="small"
                />
              </Box>
              <List sx={{ width: '100%' }}>
                {client.insights.map((insight, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getInsightIcon(insight.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={insight.message}
                      secondary={
                        <Chip
                          label={`${insight.impact} impact`}
                          size="small"
                          color={getImpactColor(insight.impact)}
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 
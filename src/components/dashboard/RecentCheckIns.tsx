import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAIService } from '@/hooks/useAIService';
import { formatDistanceToNow } from 'date-fns';

interface CheckIn {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'missed';
  metrics: {
    [key: string]: number;
  };
  aiSummary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export const RecentCheckIns: React.FC = () => {
  const {
    data: checkIns,
    isLoading,
    error,
    execute
  } = useAIService<CheckIn[]>();

  React.useEffect(() => {
    execute('recent-checkins', async () => {
      const response = await fetch('/api/ai/analysis/recent-checkins');
      if (!response.ok) throw new Error('Failed to fetch recent check-ins');
      return response.json();
    });
  }, [execute]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading recent check-ins: {error}
      </Typography>
    );
  }

  const getStatusColor = (status: CheckIn['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'missed':
        return 'error';
    }
  };

  const getSentimentColor = (sentiment: CheckIn['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader
        title="Recent Check-ins"
        subheader="Latest client check-ins with AI insights"
      />
      <CardContent>
        <List>
          {checkIns?.map((checkIn) => (
            <ListItem
              key={checkIn.id}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 1 }}>
                <ListItemAvatar>
                  <Avatar src={checkIn.clientAvatar}>
                    {checkIn.clientName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={checkIn.clientName}
                  secondary={formatDistanceToNow(new Date(checkIn.timestamp), { addSuffix: true })}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={checkIn.status}
                    color={getStatusColor(checkIn.status)}
                    size="small"
                  />
                  <Chip
                    label={checkIn.sentiment}
                    color={getSentimentColor(checkIn.sentiment)}
                    size="small"
                  />
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {checkIn.aiSummary}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(checkIn.metrics).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 
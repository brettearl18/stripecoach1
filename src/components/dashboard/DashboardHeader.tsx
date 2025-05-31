'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Stack
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  onDateRangeChange?: (range: [Date, Date]) => void;
  onRefresh?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onDateRangeChange,
  onRefresh,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = React.useState('week');
  const [dateRange, setDateRange] = React.useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
    // Update date range based on selection
    const now = new Date();
    let startDate = new Date();
    
    switch (event.target.value) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    setDateRange([startDate, now]);
    onDateRangeChange?.([startDate, now]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="h4" component="h1">
          Coach Dashboard
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DashboardHeader; 
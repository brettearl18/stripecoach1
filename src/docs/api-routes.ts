import { ApiRoute } from '../types';

export const apiRoutes: ApiRoute[] = [
  {
    path: '/api/auth/login',
    method: 'POST',
    description: 'Authenticate user and return JWT token',
    parameters: {
      email: 'string',
      password: 'string'
    },
    response: {
      token: 'string',
      user: 'User'
    },
    auth: false
  },
  {
    path: '/api/coaches',
    method: 'GET',
    description: 'Get list of coaches with optional filters',
    parameters: {
      specialty: 'string?',
      rating: 'number?',
      experience: 'number?'
    },
    response: {
      coaches: 'Coach[]',
      total: 'number'
    },
    auth: false
  },
  {
    path: '/api/coaches/:id',
    method: 'GET',
    description: 'Get detailed coach information',
    parameters: {
      id: 'string'
    },
    response: {
      coach: 'Coach',
      clients: 'Client[]',
      analytics: 'CoachMetrics'
    },
    auth: false
  },
  {
    path: '/api/clients',
    method: 'GET',
    description: 'Get list of clients for authenticated coach',
    parameters: {
      status: 'active | inactive',
      search: 'string?'
    },
    response: {
      clients: 'Client[]',
      total: 'number'
    },
    auth: true
  },
  {
    path: '/api/clients/:id/progress',
    method: 'GET',
    description: 'Get client progress data',
    parameters: {
      id: 'string',
      startDate: 'Date?',
      endDate: 'Date?'
    },
    response: {
      progress: 'ClientProgress',
      checkIns: 'CheckIn[]',
      achievements: 'Achievement[]'
    },
    auth: true
  },
  {
    path: '/api/analytics',
    method: 'GET',
    description: 'Get analytics data for admin dashboard',
    parameters: {
      period: 'day | week | month | year',
      metrics: 'string[]'
    },
    response: {
      analytics: 'Analytics',
      revenue: 'RevenueMetrics',
      clients: 'ClientMetrics',
      coaches: 'CoachMetrics'
    },
    auth: true
  },
  {
    path: '/api/forms/submit',
    method: 'POST',
    description: 'Submit a form (check-in, goal, feedback)',
    parameters: {
      type: 'check-in | goal | feedback',
      data: 'Record<string, any>'
    },
    response: {
      submission: 'FormSubmission'
    },
    auth: true
  }
]; 
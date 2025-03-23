'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ServerIcon,
  ArrowPathRoundedSquareIcon,
  DocumentDuplicateIcon,
  BellIcon,
  CreditCardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { OpenAIService } from '@/lib/services/openaiService';
import { apiRoutes } from '@/docs/api-routes';

interface PageNode {
  id: string;
  name: string;
  path: string;
  icon: any;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  connections?: string[];
  children?: PageNode[];
}

const siteStructure: PageNode[] = [
  {
    id: 'home',
    name: 'Home',
    path: '/',
    icon: HomeIcon,
    status: 'completed',
    description: 'Landing page with coach listings and features',
    connections: ['coach-search', 'about', 'contact'],
    children: [
      {
        id: 'coach-search',
        name: 'Coach Search',
        path: '/search',
        icon: UserGroupIcon,
        status: 'completed',
        description: 'Search and filter coaches by specialty',
        connections: ['coach-profile', 'search-filters'],
        children: [
          {
            id: 'search-filters',
            name: 'Search Filters',
            path: '/search/filters',
            icon: Cog6ToothIcon,
            status: 'completed',
            description: 'Advanced search filters and preferences',
            connections: ['coach-search']
          }
        ]
      },
      {
        id: 'coach-profile',
        name: 'Coach Profile',
        path: '/coach/[id]',
        icon: UserIcon,
        status: 'completed',
        description: 'Detailed coach profile and booking',
        connections: ['booking', 'reviews', 'coach-dashboard'],
        children: [
          {
            id: 'booking',
            name: 'Booking',
            path: '/coach/[id]/booking',
            icon: CalendarIcon,
            status: 'completed',
            description: 'Schedule coaching sessions',
            connections: ['payments', 'schedule']
          },
          {
            id: 'reviews',
            name: 'Reviews',
            path: '/coach/[id]/reviews',
            icon: DocumentTextIcon,
            status: 'completed',
            description: 'Client reviews and testimonials',
            connections: ['client-profiles']
          }
        ]
      },
      {
        id: 'about',
        name: 'About Us',
        path: '/about',
        icon: BuildingOfficeIcon,
        status: 'completed',
        description: 'Company information and mission',
      },
      {
        id: 'contact',
        name: 'Contact',
        path: '/contact',
        icon: BellIcon,
        status: 'completed',
        description: 'Contact information and support',
      }
    ]
  },
  {
    id: 'admin',
    name: 'Admin Dashboard',
    path: '/admin',
    icon: BuildingOfficeIcon,
    status: 'completed',
    description: 'Admin control panel and analytics',
    connections: ['analytics', 'settings', 'users', 'coach-management', 'billing', 'reports'],
    children: [
      {
        id: 'analytics',
        name: 'Analytics',
        path: '/admin/analytics',
        icon: ChartBarIcon,
        status: 'in-progress',
        description: 'Coach performance metrics and client analytics',
        connections: ['client-metrics', 'revenue-analytics', 'coach-performance', 'reports'],
        children: [
          {
            id: 'client-metrics',
            name: 'Client Metrics',
            path: '/admin/analytics/clients',
            icon: ChartBarIcon,
            status: 'planned',
            description: 'Detailed client progress tracking',
            connections: ['client-profiles', 'progress-tracking']
          },
          {
            id: 'revenue-analytics',
            name: 'Revenue Analytics',
            path: '/admin/analytics/revenue',
            icon: ChartBarIcon,
            status: 'planned',
            description: 'Revenue tracking and forecasting',
            connections: ['billing', 'payments', 'subscriptions']
          },
          {
            id: 'coach-performance',
            name: 'Coach Performance',
            path: '/admin/analytics/coaches',
            icon: UserGroupIcon,
            status: 'planned',
            description: 'Coach success metrics and ratings',
            connections: ['coach-profiles', 'reviews', 'revenue-analytics']
          }
        ]
      },
      {
        id: 'settings',
        name: 'Settings',
        path: '/admin/settings',
        icon: Cog6ToothIcon,
        status: 'completed',
        description: 'System configuration and preferences',
        connections: ['security', 'notifications', 'integrations', 'billing'],
        children: [
          {
            id: 'security',
            name: 'Security',
            path: '/admin/settings/security',
            icon: ServerIcon,
            status: 'completed',
            description: 'Security settings and access control',
            connections: ['users', 'audit-logs']
          },
          {
            id: 'notifications',
            name: 'Notifications',
            path: '/admin/settings/notifications',
            icon: BellIcon,
            status: 'completed',
            description: 'Notification preferences and templates',
            connections: ['email-templates', 'push-notifications']
          },
          {
            id: 'integrations',
            name: 'Integrations',
            path: '/admin/settings/integrations',
            icon: ArrowPathRoundedSquareIcon,
            status: 'planned',
            description: 'Third-party service integrations',
            connections: ['payment-gateway', 'email-service', 'analytics-service']
          }
        ]
      },
      {
        id: 'users',
        name: 'User Management',
        path: '/admin/users',
        icon: UserGroupIcon,
        status: 'completed',
        description: 'Manage users and permissions',
        connections: ['coach-profiles', 'client-profiles', 'security'],
        children: [
          {
            id: 'coach-profiles',
            name: 'Coach Profiles',
            path: '/admin/users/coaches',
            icon: UserIcon,
            status: 'completed',
            description: 'Manage coach accounts and verification',
            connections: ['coach-performance', 'payments']
          },
          {
            id: 'client-profiles',
            name: 'Client Profiles',
            path: '/admin/users/clients',
            icon: UserGroupIcon,
            status: 'completed',
            description: 'Manage client accounts and subscriptions',
            connections: ['client-metrics', 'payments']
          }
        ]
      },
      {
        id: 'billing',
        name: 'Billing & Payments',
        path: '/admin/billing',
        icon: CreditCardIcon,
        status: 'in-progress',
        description: 'Payment processing and financial management',
        connections: ['revenue-analytics', 'coach-profiles', 'client-profiles'],
        children: [
          {
            id: 'payments',
            name: 'Payment History',
            path: '/admin/billing/payments',
            icon: CreditCardIcon,
            status: 'completed',
            description: 'Transaction history and refunds',
            connections: ['revenue-analytics']
          },
          {
            id: 'subscriptions',
            name: 'Subscriptions',
            path: '/admin/billing/subscriptions',
            icon: ArrowPathIcon,
            status: 'in-progress',
            description: 'Manage subscription plans and pricing',
            connections: ['client-profiles', 'revenue-analytics']
          }
        ]
      },
      {
        id: 'reports',
        name: 'Reports',
        path: '/admin/reports',
        icon: DocumentTextIcon,
        status: 'planned',
        description: 'Generate and export system reports',
        connections: ['analytics', 'billing', 'users'],
        children: [
          {
            id: 'audit-logs',
            name: 'Audit Logs',
            path: '/admin/reports/audit',
            icon: DocumentDuplicateIcon,
            status: 'planned',
            description: 'System activity and security logs',
            connections: ['security']
          },
          {
            id: 'performance-reports',
            name: 'Performance Reports',
            path: '/admin/reports/performance',
            icon: ChartBarIcon,
            status: 'planned',
            description: 'Platform performance and metrics',
            connections: ['analytics', 'coach-performance']
          }
        ]
      }
    ]
  },
  {
    id: 'coach-dashboard',
    name: 'Coach Dashboard',
    path: '/coach/dashboard',
    icon: UserGroupIcon,
    status: 'in-progress',
    description: 'Coach-specific dashboard and tools',
    children: [
      {
        id: 'client-management',
        name: 'Client Management',
        path: '/coach/dashboard/clients',
        icon: UserGroupIcon,
        status: 'in-progress',
        description: 'Client list and progress tracking',
        children: [
          {
            id: 'client-profiles',
            name: 'Client Profiles',
            path: '/coach/dashboard/clients/profiles',
            icon: UserIcon,
            status: 'completed',
            description: 'Detailed client information',
          },
          {
            id: 'progress-tracking',
            name: 'Progress Tracking',
            path: '/coach/dashboard/clients/progress',
            icon: ChartBarIcon,
            status: 'in-progress',
            description: 'Track client progress and goals',
          }
        ]
      },
      {
        id: 'programs',
        name: 'Programs',
        path: '/coach/dashboard/programs',
        icon: DocumentTextIcon,
        status: 'planned',
        description: 'Program creation and management',
        children: [
          {
            id: 'program-builder',
            name: 'Program Builder',
            path: '/coach/dashboard/programs/builder',
            icon: DocumentDuplicateIcon,
            status: 'planned',
            description: 'Create and customize programs',
          },
          {
            id: 'program-templates',
            name: 'Templates',
            path: '/coach/dashboard/programs/templates',
            icon: DocumentTextIcon,
            status: 'planned',
            description: 'Program templates library',
          }
        ]
      },
      {
        id: 'analytics',
        name: 'Coach Analytics',
        path: '/coach/dashboard/analytics',
        icon: ChartBarIcon,
        status: 'planned',
        description: 'Personal performance metrics',
        children: [
          {
            id: 'revenue',
            name: 'Revenue',
            path: '/coach/dashboard/analytics/revenue',
            icon: CreditCardIcon,
            status: 'planned',
            description: 'Revenue tracking and reports',
          },
          {
            id: 'client-success',
            name: 'Client Success',
            path: '/coach/dashboard/analytics/success',
            icon: ChartBarIcon,
            status: 'planned',
            description: 'Client success metrics',
          }
        ]
      },
      {
        id: 'schedule',
        name: 'Schedule',
        path: '/coach/dashboard/schedule',
        icon: CalendarIcon,
        status: 'completed',
        description: 'Session scheduling and calendar',
      }
    ]
  },
  {
    id: 'client-dashboard',
    name: 'Client Dashboard',
    path: '/client/dashboard',
    icon: UserIcon,
    status: 'completed',
    description: 'Client-specific dashboard and tools',
    children: [
      {
        id: 'check-ins',
        name: 'Check-ins',
        path: '/client/dashboard/check-ins',
        icon: DocumentDuplicateIcon,
        status: 'completed',
        description: 'Submit progress check-ins',
      },
      {
        id: 'progress',
        name: 'Progress Tracking',
        path: '/client/dashboard/progress',
        icon: ChartBarIcon,
        status: 'in-progress',
        description: 'View progress and achievements',
      },
      {
        id: 'programs',
        name: 'My Programs',
        path: '/client/dashboard/programs',
        icon: DocumentTextIcon,
        status: 'completed',
        description: 'View assigned programs',
      },
      {
        id: 'schedule',
        name: 'Schedule',
        path: '/client/dashboard/schedule',
        icon: CalendarIcon,
        status: 'completed',
        description: 'View and manage sessions',
      },
      {
        id: 'payments',
        name: 'Payments',
        path: '/client/dashboard/payments',
        icon: CreditCardIcon,
        status: 'completed',
        description: 'Payment history and billing',
      }
    ]
  }
];

const statusColors = {
  completed: 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  planned: 'bg-blue-500'
};

const statusIcons = {
  completed: CheckCircleIcon,
  'in-progress': ArrowPathIcon,
  planned: ExclamationCircleIcon
};

function PageNode({ node, level = 0 }: { node: PageNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const StatusIcon = statusIcons[node.status];

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className="flex items-center gap-2 mb-4"
        style={{ marginLeft: `${level * 2}rem` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-700/50 rounded-full"
        >
          <node.icon className="h-5 w-5 text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{node.name}</span>
          <StatusIcon className={`h-4 w-4 ${statusColors[node.status]}`} />
        </div>
      </motion.div>

      {isExpanded && node.children && (
        <div className="space-y-4">
          {node.children.map((child) => (
            <PageNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const initialNodes: Node[] = [
  // Home and Public Pages
  {
    id: 'home',
    position: { x: 0, y: 0 },
    data: { label: 'Home', icon: HomeIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'coach-search',
    position: { x: 200, y: -100 },
    data: { label: 'Coach Search', icon: UserGroupIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'coach-profile',
    position: { x: 200, y: 0 },
    data: { label: 'Coach Profile', icon: UserIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'about',
    position: { x: 200, y: 100 },
    data: { label: 'About Us', icon: BuildingOfficeIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'contact',
    position: { x: 200, y: 200 },
    data: { label: 'Contact', icon: BellIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Admin Section
  {
    id: 'admin',
    position: { x: 400, y: 0 },
    data: { label: 'Admin Dashboard', icon: BuildingOfficeIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'analytics',
    position: { x: 600, y: -100 },
    data: { label: 'Analytics', icon: ChartBarIcon, status: 'in-progress' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'client-metrics',
    position: { x: 800, y: -150 },
    data: { label: 'Client Metrics', icon: ChartBarIcon, status: 'planned' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'revenue-analytics',
    position: { x: 800, y: -50 },
    data: { label: 'Revenue Analytics', icon: ChartBarIcon, status: 'planned' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'coach-performance',
    position: { x: 800, y: 50 },
    data: { label: 'Coach Performance', icon: UserGroupIcon, status: 'planned' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'settings',
    position: { x: 600, y: 0 },
    data: { label: 'Settings', icon: Cog6ToothIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'users',
    position: { x: 600, y: 100 },
    data: { label: 'User Management', icon: UserGroupIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Coach Section
  {
    id: 'coach-dashboard',
    position: { x: 400, y: 100 },
    data: { label: 'Coach Dashboard', icon: UserGroupIcon, status: 'in-progress' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'client-management',
    position: { x: 600, y: 50 },
    data: { label: 'Client Management', icon: UserIcon, status: 'in-progress' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'programs',
    position: { x: 600, y: 150 },
    data: { label: 'Programs', icon: DocumentTextIcon, status: 'planned' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'schedule',
    position: { x: 600, y: 250 },
    data: { label: 'Schedule', icon: CalendarIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Client Section
  {
    id: 'client-dashboard',
    position: { x: 400, y: 200 },
    data: { label: 'Client Dashboard', icon: UserIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'check-ins',
    position: { x: 600, y: 200 },
    data: { label: 'Check-ins', icon: DocumentDuplicateIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'progress',
    position: { x: 800, y: 200 },
    data: { label: 'Progress Tracking', icon: ChartBarIcon, status: 'in-progress' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'payments',
    position: { x: 600, y: 300 },
    data: { label: 'Payments', icon: CreditCardIcon, status: 'completed' },
    type: 'custom',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }
];

const initialEdges: Edge[] = [
  // Home connections
  { id: 'home-search', source: 'home', target: 'coach-search', animated: true },
  { id: 'home-profile', source: 'home', target: 'coach-profile', animated: true },
  { id: 'home-about', source: 'home', target: 'about', animated: true },
  { id: 'home-contact', source: 'home', target: 'contact', animated: true },
  { id: 'home-admin', source: 'home', target: 'admin', animated: true },
  { id: 'home-coach', source: 'home', target: 'coach-dashboard', animated: true },
  { id: 'home-client', source: 'home', target: 'client-dashboard', animated: true },
  
  // Admin connections
  { id: 'admin-analytics', source: 'admin', target: 'analytics', animated: true },
  { id: 'analytics-client-metrics', source: 'analytics', target: 'client-metrics', animated: true },
  { id: 'analytics-revenue', source: 'analytics', target: 'revenue-analytics', animated: true },
  { id: 'analytics-coach-performance', source: 'analytics', target: 'coach-performance', animated: true },
  { id: 'admin-settings', source: 'admin', target: 'settings', animated: true },
  { id: 'admin-users', source: 'admin', target: 'users', animated: true },
  
  // Coach connections
  { id: 'coach-clients', source: 'coach-dashboard', target: 'client-management', animated: true },
  { id: 'coach-programs', source: 'coach-dashboard', target: 'programs', animated: true },
  { id: 'coach-schedule', source: 'coach-dashboard', target: 'schedule', animated: true },
  
  // Client connections
  { id: 'client-checkins', source: 'client-dashboard', target: 'check-ins', animated: true },
  { id: 'client-progress', source: 'client-dashboard', target: 'progress', animated: true },
  { id: 'client-payments', source: 'client-dashboard', target: 'payments', animated: true },
  
  // Cross-section connections
  { id: 'coach-profile-dashboard', source: 'coach-profile', target: 'coach-dashboard', animated: true },
  { id: 'client-progress-coach', source: 'progress', target: 'client-management', animated: true },
  { id: 'checkins-progress', source: 'check-ins', target: 'progress', animated: true }
];

const CustomNode = ({ data }: { data: any }) => {
  const StatusIcon = statusIcons[data.status];
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="px-4 py-2 shadow-lg rounded-lg border-2 border-gray-700 bg-[#1A1F2B] relative group"
    >
      <div className="flex items-center gap-2">
        <data.icon className="h-5 w-5 text-blue-500" />
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{data.label}</span>
          <StatusIcon className={`h-4 w-4 ${statusColors[data.status]}`} />
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg -top-12 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-xs">{data.description}</p>
        {data.connections && (
          <div className="mt-1 text-xs text-gray-400">
            Connected to: {data.connections.join(', ')}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${statusColors[data.status]}`} />
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function SitemapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flowVisible, setFlowVisible] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [viewMode, setViewMode] = useState<'default' | 'data-flow' | 'security'>('default');

  // Enhanced edge styles based on data flow type
  const getEdgeStyle = (edge: Edge) => {
    if (viewMode === 'data-flow') {
      return {
        stroke: '#3b82f6',
        strokeWidth: 2,
        animated: true,
        style: { animation: 'flowAnimation 20s linear infinite' }
      };
    }
    if (viewMode === 'security') {
      return {
        stroke: '#10b981',
        strokeWidth: 2,
        animated: true
      };
    }
    return {
      stroke: '#64748b',
      strokeWidth: 1,
      animated: false
    };
  };

  const analyzePage = async (page: string) => {
    try {
      setLoading(true);
      setError(null);
      const pageAnalysis = await OpenAIService.analyzePage(page, apiRoutes);
      setAnalysis(pageAnalysis);
    } catch (err) {
      setError('Failed to analyze page. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDataFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      const flowAnalysis = await OpenAIService.analyzeDataFlow(apiRoutes);
      setAnalysis(flowAnalysis);
    } catch (err) {
      setError('Failed to analyze data flow. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOptimizations = async (page: string, connections: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const optimizations = await OpenAIService.suggestOptimizations(page, connections);
      setAnalysis(optimizations);
    } catch (err) {
      setError('Failed to get optimizations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    analyzePage(node.data.label);
  };

  return (
    <div className="h-screen w-full flex">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="space-y-2">
          <button
            onClick={() => setViewMode('default')}
            className={`w-full px-4 py-2 rounded ${
              viewMode === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Default View
          </button>
          <button
            onClick={() => setViewMode('data-flow')}
            className={`w-full px-4 py-2 rounded ${
              viewMode === 'data-flow' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Data Flow View
          </button>
          <button
            onClick={() => setViewMode('security')}
            className={`w-full px-4 py-2 rounded ${
              viewMode === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Security View
          </button>
        </div>
      </div>

      {/* Main Flow Area */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges.map(edge => ({
            ...edge,
            ...getEdgeStyle(edge),
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: viewMode === 'security' ? '#10b981' : '#3b82f6'
            }
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={(_, edge) => setSelectedEdge(edge)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={node => {
              return statusColors[node.data.status].replace('bg-', '#');
            }}
            maskColor="rgba(0, 0, 0, 0.2)"
          />
        </ReactFlow>
      </div>

      {/* Analysis Panel */}
      <div className="w-96 bg-[#1A1F2B] border-l border-gray-700 p-4 overflow-y-auto text-white">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Analysis</h2>
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-md">
              {error}
            </div>
          )}

          {selectedNode && analysis && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Page Analysis</h3>
                <p className="text-sm text-gray-300">{analysis.description}</p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Data Flow</h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {analysis.connections.map((connection: string, index: number) => (
                    <li key={index}>{connection}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Security Considerations</h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {analysis.dataDependencies.map((dependency: string, index: number) => (
                    <li key={index}>{dependency}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Optimizations</h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {analysis.suggestedImprovements.map((improvement: string, index: number) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={analyzeDataFlow}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Analyze Data Flow
            </button>
          </div>
        </div>
      </div>

      {/* Edge Details Popup */}
      {selectedEdge && (
        <div className="absolute bottom-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg z-10">
          <h3 className="text-white font-medium mb-2">Connection Details</h3>
          <p className="text-sm text-gray-300">
            {selectedEdge.source} → {selectedEdge.target}
          </p>
          <button
            onClick={() => setSelectedEdge(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
} 
# Stripe Coach Admin Data Flow Documentation

## 1. Core Data Models 📊

### Company Data
```typescript
interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription: {
    plan: string;
    status: 'active' | 'past_due' | 'canceled';
    startDate: Date;
    endDate: Date;
    billingCycle: 'monthly' | 'annual';
    amount: number;
  };
  settings: {
    maxCoaches: number;
    maxClientsPerCoach: number;
    features: string[];
    customization: {
      logo: string;
      colors: {
        primary: string;
        secondary: string;
      };
    };
  };
  billing: {
    contactName: string;
    email: string;
    address: Address;
    paymentMethod: PaymentMethod[];
    invoices: Invoice[];
  };
  metrics: {
    totalRevenue: number;
    activeCoaches: number;
    totalClients: number;
    averageClientEngagement: number;
  };
}
```

### Coach Data
```typescript
interface Coach {
  id: string;
  companyId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
    avatar: string;
  };
  professional: {
    specialties: string[];
    certifications: Certification[];
    experience: number;
    bio: string;
  };
  metrics: {
    activeClients: number;
    completionRate: number;
    responseTime: number;
    clientProgress: number;
    satisfaction: number;
  };
  performance: {
    rating: number;
    reviews: Review[];
    achievements: Achievement[];
  };
  availability: {
    schedule: Schedule;
    maxClients: number;
    currentLoad: number;
  };
}
```

### Client Data
```typescript
interface Client {
  id: string;
  companyId: string;
  coachId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
  };
  program: {
    startDate: Date;
    goals: Goal[];
    checkIns: CheckIn[];
    progress: Progress;
  };
  engagement: {
    lastActive: Date;
    checkInCompletion: number;
    responseRate: number;
    satisfaction: number;
  };
  metrics: {
    progressScore: number;
    milestones: Milestone[];
    trends: Trend[];
  };
}
```

## 2. Data Flow Patterns 🔄

### Dashboard Metrics Flow
1. **Revenue Data**
   - Daily revenue aggregation
   - Subscription status updates
   - Payment processing events
   - Refund tracking
   - Revenue forecasting

2. **Coach Performance Data**
   - Real-time activity monitoring
   - Response time calculations
   - Client satisfaction aggregation
   - Completion rate tracking
   - Performance trend analysis

3. **Client Engagement Data**
   - Check-in completion rates
   - Progress measurements
   - Goal achievement tracking
   - Interaction frequency
   - Satisfaction metrics

## 3. Real-time Updates 🔄

### WebSocket Events
```typescript
interface WebSocketEvents {
  'coach.status.update': {
    coachId: string;
    status: 'online' | 'offline' | 'busy';
    lastActive: Date;
  };
  'client.checkin.submitted': {
    clientId: string;
    checkInId: string;
    timestamp: Date;
    data: CheckInData;
  };
  'metrics.update': {
    type: 'revenue' | 'engagement' | 'performance';
    data: MetricData;
    timestamp: Date;
  };
}
```

## 4. API Endpoints 🔌

### Company Management
```typescript
// GET /api/companies
// GET /api/companies/:id
// POST /api/companies
// PUT /api/companies/:id
// DELETE /api/companies/:id
// GET /api/companies/:id/metrics
// GET /api/companies/:id/billing
```

### Coach Management
```typescript
// GET /api/coaches
// GET /api/coaches/:id
// POST /api/coaches
// PUT /api/coaches/:id
// DELETE /api/coaches/:id
// GET /api/coaches/:id/performance
// GET /api/coaches/:id/clients
```

### Client Management
```typescript
// GET /api/clients
// GET /api/clients/:id
// POST /api/clients
// PUT /api/clients/:id
// DELETE /api/clients/:id
// GET /api/clients/:id/progress
// GET /api/clients/:id/checkins
```

## 5. Data Aggregation 📊

### Metrics Calculation
```typescript
interface MetricsAggregation {
  revenue: {
    daily: number[];
    monthly: number[];
    annual: number;
    growth: number;
  };
  engagement: {
    activeUsers: number;
    checkInRate: number;
    satisfactionScore: number;
  };
  performance: {
    coachRatings: number[];
    clientProgress: number[];
    completionRates: number[];
  };
}
```

## 6. Data Storage 💾

### Firebase Services
```typescript
interface FirebaseConfig {
  // Firestore Collections
  collections: {
    companies: Collection<Company>;
    coaches: Collection<Coach>;
    clients: Collection<Client>;
    subscriptions: Collection<Subscription>;
    payments: Collection<Payment>;
    checkIns: Collection<CheckIn>;
    metrics: Collection<Metric>;
    analytics: Collection<Analytics>;
  };
  
  // Firebase Storage
  storage: {
    profileImages: StorageReference;
    companyLogos: StorageReference;
    documents: StorageReference;
    certifications: StorageReference;
    mediaAssets: StorageReference;
  };

  // Realtime Database
  realtime: {
    onlineStatus: Reference;
    metrics: Reference;
    notifications: Reference;
  };

  // Firebase Authentication
  auth: {
    customClaims: {
      admin: boolean;
      companyId: string;
      role: 'admin' | 'company' | 'coach' | 'client';
    };
    providers: [
      'email',
      'google',
      'facebook'
    ];
  };
}

// Storage Rules
interface StorageRules {
  'profiles/{userId}': {
    read: 'auth != null';
    write: 'auth.uid == userId || auth.token.admin == true';
  };
  'companies/{companyId}/*': {
    read: 'auth.token.companyId == companyId';
    write: 'auth.token.role == "admin" || auth.token.companyId == companyId';
  };
  'certifications/{coachId}': {
    read: 'auth != null';
    write: 'auth.uid == coachId || auth.token.admin == true';
  };
}

// Firestore Security Rules
interface FirestoreRules {
  'companies/{companyId}': {
    read: 'auth.token.companyId == companyId || auth.token.admin == true';
    write: 'auth.token.admin == true';
  };
  'coaches/{coachId}': {
    read: 'auth != null';
    write: 'auth.uid == coachId || auth.token.admin == true';
  };
  'clients/{clientId}': {
    read: 'auth.uid == clientId || auth.token.admin == true || 
          (auth.token.role == "coach" && exists(/coaches/$(auth.uid)/clients/$(clientId)))';
    write: 'auth.token.admin == true || auth.token.role == "coach"';
  };
}

### Caching Strategy
```typescript
interface CacheConfig {
  firestoreCache: {
    metrics: {
      ttl: 300000, // 5 minutes
      maxSize: 1000,
    };
    userProfiles: {
      ttl: 600000, // 10 minutes
      maxSize: 500,
    };
    companyData: {
      ttl: 900000, // 15 minutes
      maxSize: 100,
    };
  };
  realtimeSync: {
    onlinePresence: boolean;
    metricUpdates: boolean;
    notifications: boolean;
  };
  persistentStorage: {
    enabled: boolean;
    maxSize: number;
  };
}

## 7. Event Processing 🔄

### System Events
```typescript
type SystemEvent =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'coach.added'
  | 'coach.removed'
  | 'client.added'
  | 'client.removed'
  | 'checkin.submitted'
  | 'metric.updated';
```

## 8. Analytics Data 📈

### Tracking Metrics
```typescript
interface AnalyticsData {
  userActivity: {
    pageViews: number;
    interactions: number;
    sessionDuration: number;
  };
  businessMetrics: {
    mrr: number;
    churnRate: number;
    customerLifetimeValue: number;
  };
  platformMetrics: {
    apiLatency: number;
    errorRate: number;
    uptime: number;
  };
}
```

## 9. Security & Compliance 🔒

### Data Access Patterns
```typescript
interface DataAccessControl {
  roles: {
    admin: string[];
    company: string[];
    coach: string[];
    client: string[];
  };
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  audit: {
    accessLogs: Log[];
    changes: Change[];
    timestamps: Timestamp[];
  };
}
```

## 10. Integration Points 🔌

### Firebase Services
- Firebase Authentication (User Management)
- Cloud Firestore (Main Database)
- Firebase Storage (File Storage)
- Realtime Database (Real-time Features)
- Cloud Functions (Serverless Backend)
- Firebase Analytics (Usage Tracking)

### External Services
- Stripe (Payments)
- SendGrid (Email)
- Twilio (SMS)
- Analytics Tools

### Firebase Cloud Functions
```typescript
interface CloudFunctions {
  auth: {
    onUserCreated: Function<UserRecord>;
    onUserDeleted: Function<UserRecord>;
    onCustomClaimUpdated: Function<Claims>;
  };
  firestore: {
    onCompanyCreated: Function<Company>;
    onCoachAssigned: Function<Assignment>;
    onClientAdded: Function<Client>;
    onMetricsUpdated: Function<Metrics>;
  };
  storage: {
    onFileUploaded: Function<File>;
    onProfileImageUpdated: Function<Image>;
  };
  scheduled: {
    dailyMetricsAggregation: Function<void>;
    weeklyReports: Function<void>;
    monthlyBilling: Function<void>;
  };
  api: {
    stripeWebhook: HttpsFunction;
    externalIntegrations: HttpsFunction;
  };
} 
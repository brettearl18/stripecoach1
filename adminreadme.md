# Admin Dashboard Documentation

## Overview
The admin dashboard provides comprehensive system management capabilities with hierarchical access control:
- **Admin**: Full system access
- **Coaches**: Access to their own clients
- **Clients**: Access to their own data

## Access Control Structure

### Admin Level
- Full system access
- Can create and manage coaches
- Can create and manage clients
- Can view all analytics and reports
- Can manage system settings

### Coach Level
- Access limited to their assigned clients
- Can view client progress and analytics
- Can manage client check-ins
- Cannot access other coaches' clients

### Client Level
- Access limited to their own data
- Can view their progress
- Can submit check-ins
- Cannot access other clients' data

## Admin Features

### Coach Management
- Create new coach accounts
- Assign coach roles and permissions
- Monitor coach performance
- View coach analytics
- Manage coach access

### Client Management
- Create new client accounts
- Assign clients to coaches
- View all client data
- Monitor client progress
- Manage client subscriptions

### Analytics & Reporting
- System-wide analytics
- Coach performance metrics
- Client progress tracking
- Revenue and subscription reports
- Usage statistics

### System Settings
- Configure system parameters
- Manage subscription plans
- Set up notification rules
- Configure check-in forms
- Manage access controls

## Database Structure

### Collections
1. `admins`
   - Admin user profiles
   - System settings
   - Access control rules

2. `coaches`
   - Coach profiles
   - Performance metrics
   - Client assignments

3. `clients`
   - Client profiles
   - Coach assignments
   - Subscription status

4. `checkIns`
   - Client submissions
   - Coach responses
   - Analytics data

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Coach access
    function isCoach(clientId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/clients/$(clientId)).data.coachId == request.auth.uid;
    }
    
    // Client access
    function isClient(clientId) {
      return request.auth != null && 
        request.auth.uid == clientId;
    }

    // Collection rules
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    match /coaches/{coachId} {
      allow read: if isAdmin() || request.auth.uid == coachId;
      allow write: if isAdmin();
    }
    
    match /clients/{clientId} {
      allow read: if isAdmin() || isCoach(clientId) || isClient(clientId);
      allow write: if isAdmin() || isCoach(clientId);
    }
    
    match /checkIns/{checkInId} {
      allow read: if isAdmin() || isCoach(resource.data.clientId) || isClient(resource.data.clientId);
      allow write: if isAdmin() || isCoach(request.resource.data.clientId) || isClient(request.resource.data.clientId);
    }
  }
}
```

## API Endpoints

### Admin Endpoints
- `POST /api/admin/coaches` - Create new coach
- `GET /api/admin/coaches` - List all coaches
- `PUT /api/admin/coaches/{id}` - Update coach
- `DELETE /api/admin/coaches/{id}` - Delete coach

- `POST /api/admin/clients` - Create new client
- `GET /api/admin/clients` - List all clients
- `PUT /api/admin/clients/{id}` - Update client
- `DELETE /api/admin/clients/{id}` - Delete client

### Analytics Endpoints
- `GET /api/admin/analytics/coaches` - Coach performance metrics
- `GET /api/admin/analytics/clients` - Client progress metrics
- `GET /api/admin/analytics/revenue` - Revenue reports

## Implementation Notes

### Authentication
- Admin accounts use Firebase Authentication
- Role-based access control through custom claims
- Session management and security

### Data Access
- Hierarchical data access through Firestore rules
- Real-time updates for live monitoring
- Cached data for performance

### Monitoring
- Activity logging for all admin actions
- Audit trail for security compliance
- Performance monitoring

## Future Enhancements
1. Advanced analytics dashboard
2. Bulk operations for client/coach management
3. Custom report generation
4. API rate limiting and quotas
5. Enhanced security features 
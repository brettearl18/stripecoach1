# Application Sitemap

## 📁 Root (/)
- **Purpose**: Landing page and authentication
- **Layout**: 
  - Hero section with value proposition
  - Login/Register options
  - Role-based redirects (Admin/Coach/Client)

## 📁 Admin Section (/admin)
### Dashboard (/admin/dashboard)
- **Purpose**: System overview and key metrics
- **Layout**:
  - System statistics cards
  - Active coaches/clients count
  - Recent activity feed
  - Quick action buttons

### Coach Management (/admin/coaches)
- **Purpose**: Manage coach accounts and performance
- **Layout**:
  - Coach list with search/filter
  - Coach details modal
  - Performance metrics
  - Client assignments
  - Action buttons (edit/delete/suspend)

### Client Management (/admin/clients)
- **Purpose**: Oversee all clients and assignments
- **Layout**:
  - Client list with search/filter
  - Client details view
  - Coach assignment interface
  - Subscription management
  - Bulk actions

### Analytics (/admin/analytics)
- **Purpose**: System-wide performance tracking
- **Layout**:
  - Revenue charts
  - Coach performance metrics
  - Client progress tracking
  - Custom report builder
  - Export functionality

### Settings (/admin/settings)
- **Purpose**: System configuration
- **Layout**:
  - Subscription plan management
  - Form templates
  - Notification settings
  - Access control rules
  - System parameters

## 📁 Coach Section (/coach)
### Dashboard (/coach/dashboard)
- **Purpose**: Coach's client overview
- **Layout**:
  - Client list
  - Pending check-ins
  - Client progress cards
  - Quick actions

### Clients (/coach/clients)
- **Purpose**: Manage assigned clients
- **Layout**:
  - Client cards with status
  - Progress tracking
  - Check-in history
  - Client details view

### Check-ins (/coach/check-ins)
- **Purpose**: Review client submissions
- **Layout**:
  - Pending check-ins list
  - Check-in review interface
  - Response templates
  - Analytics view

### Analytics (/coach/analytics)
- **Purpose**: Client performance tracking
- **Layout**:
  - Client progress charts
  - Performance metrics
  - Custom reports
  - Export options

## 📁 Client Section (/client)
### Dashboard (/client/dashboard)
- **Purpose**: Personal progress overview
- **Layout**:
  - Progress summary
  - Recent check-ins
  - Goals tracking
  - Coach communication

### Check-in (/client/check-in)
- **Purpose**: Submit progress updates
- **Layout**:
  - Check-in form
  - Progress tracking
  - Previous responses
  - Coach feedback

### Profile (/client/profile)
- **Purpose**: Personal information and settings
- **Layout**:
  - Personal details
  - Goals and preferences
  - Subscription status
  - Notification settings

## 🔒 Access Control
- **Admin**: Full access to all sections
- **Coach**: Access to /coach/* and assigned clients
- **Client**: Access to /client/* and own data

## 🔄 Data Flow
1. Admin creates coach accounts
2. Admin/Coach creates client accounts
3. Clients submit check-ins
4. Coaches review and respond
5. Admin monitors system-wide progress

## 📱 Responsive Design
- Desktop: Full feature access
- Tablet: Optimized layouts
- Mobile: Essential features only 
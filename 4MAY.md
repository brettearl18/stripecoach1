# Stripe Coach Platform — Project Overview (4 May, updated 18 May)

## 1. Current Build Summary
- **Platform:** Next.js (React), Firebase (Auth, Firestore, Storage), Stripe (payments), Redis (Upstash, for AI cache)
- **User Roles:** Coach, Client, Admin
- **Core Features:**
  - Authentication & Role Management (NextAuth, Google/email, secret key set)
  - Client Onboarding & Profile Management
  - Check-in System (with photo upload, reminders, analytics)
  - Program Management (templates, assignments, tracking)
  - AI Insights (coach-only, now with distributed Redis cache)
  - Coach Notes & Client History
  - Payment Integration (Stripe)
  - Admin & Analytics Dashboards
  - Feedback & Notification System
- **Current Mode:**
  - Main client profile page (`/coach/clients/[id]`) uses comprehensive mock data for all features and navigation.
  - Firestore and Stripe integration are scaffolded and ready for production data.
  - **AI insights now use distributed Redis cache (Upstash) for scalability.**
  - **Sentry error monitoring is live (server & client).**
  - **NextAuth secret is set and validated.**

---

## 2. Dataflow Architecture

**Frontend:**
- Next.js app with role-based routing and dynamic pages.
- State managed via React hooks and context (AuthContext, etc).
- UI components for dashboard, profile, check-ins, forms, analytics, etc.

**Backend (Firebase, Redis, Sentry):**
- **Auth:** Email/password, Google sign-in, role-based access (NextAuth, in progress for Google)
- **Firestore:**
  - `users` (profile, role, preferences)
  - `clients` (profile, progress, check-ins, forms)
  - `coaches` (profile, assigned clients, analytics)
  - `checkIns` (responses, metrics, photos)
  - `programs` (templates, assignments)
  - `auditLogs` (actions, compliance)
  - `feedback`, `notifications`, `files`, etc.
- **Storage:** For photo uploads, files, and resources.
- **Stripe:**
  - Subscription plans, invoices, webhook handling.
- **Redis (Upstash):**
  - Distributed cache for AI insights (5 min TTL, fallback on error)
- **Sentry:**
  - Error monitoring for both server and client

**Data Loading:**
- Pages/components fetch data via Firestore queries or use mock data if in dev mode.
- All sensitive/coach-only data (AI insights, notes) is only shown to coaches.

---

## 3. User Workflows (by Role)

### **Coach**
- Login → Dashboard → View clients list → Select client → View/edit client profile (AI insights, notes, check-in history, progress, forms, photos, calendar)
- Create/edit programs and assign to clients
- Review check-ins, add notes, assign tasks
- View analytics and compliance
- Manage payments (via Stripe dashboard)

### **Client**
- Register via invite or sign-up
- Complete onboarding and initial assessment
- Access assigned program, submit check-ins (with photos)
- View progress, forms, and feedback
- Communicate with coach (messages, feedback)

### **Admin**
- Manage users (coaches, clients)
- View platform analytics and audit logs
- Manage subscriptions and payments
- Configure platform settings

## 3a. Workflow Completion Status

| Workflow                                      | Completion % | Status/Notes                                      |
|-----------------------------------------------|--------------|---------------------------------------------------|
| **Coach: Login & Dashboard**                  | 100%         | Fully functional, role-based access                |
| **Coach: View Clients List**                  | 100%         | List, search, filter, navigation                   |
| **Coach: View/Edit Client Profile**           | 100%         | All tabs, mock data, AI insights, notes, history   |
| **Coach: Program Management**                 | 80%          | Basic builder, templates, assignment, tracking     |
| **Coach: Check-in Review & Analytics**        | 90%          | Check-in review, analytics, reminders              |
| **Coach: Payments/Stripe**                    | 80%          | Plans, checkout, webhooks; live keys pending       |
| **Coach: Resource Library**                   | 60%          | Upload, categorize, access                        |
| **Coach: Notifications & Feedback**           | 100%         | Email, in-app, feedback modal                     |
| **Client: Registration/Onboarding**           | 100%         | Invite, sign-up, assessment, profile               |
| **Client: Program Access & Check-ins**        | 100%         | Program view, check-in submission, photo upload    |
| **Client: Progress & Forms**                  | 90%          | Progress, forms, feedback                         |
| **Client: Messaging/Feedback**                | 100%         | Messaging, feedback modal                         |
| **Admin: User Management**                    | 80%          | User CRUD, role assignment                        |
| **Admin: Analytics & Audit Logs**             | 70%          | Analytics, audit logs, reporting                   |
| **Admin: Payments/Subscriptions**             | 80%          | Stripe integration, plans, invoices                |
| **Admin: Platform Settings**                  | 60%          | Settings UI, security, compliance                  |

---

## 4. Completion Status (Feature Checklist)

| Feature                        | Status        | Notes |
|------------------------------- |--------------|-------|
| **Authentication**             | 🟡 In Progress| NextAuth secret set, Google OAuth config in progress |
| **Client Onboarding**          | ✅ Complete   | Invite, assessment, profile |
| **Client Profile Page**        | ✅ Complete   | All tabs, mock data, AI insights |
| **Check-in System**            | ✅ Complete   | Photo upload, reminders, analytics |
| **Program Management**         | 🚧 80%        | Templates, assignment, tracking; basic builder done |
| **Coach Notes & History**      | ✅ Complete   | Private notes, check-in history |
| **AI Insights (Coach-only)**   | ✅ Complete   | Now uses distributed Redis cache, Sentry monitoring |
| **Payment Integration (Stripe)**| 🚧 80%        | Plans, checkout, webhooks; live keys pending |
| **Admin Dashboard**            | 🚧 70%        | User mgmt, analytics, audit logs |
| **Analytics & Reporting**      | 🚧 75%        | Progress, compliance, export; advanced analytics post-MVP |
| **Resource Library**           | 🚧 60%        | Upload, categorize, access |
| **Feedback System**            | ✅ Complete   | Modal, Firestore integration |
| **Notifications**              | ✅ Complete   | Email, in-app, reminders |
| **Mobile Responsiveness**      | ✅ Complete   | All major pages |
| **Accessibility & SEO**        | 🚧 70%        | Color contrast, meta tags, ARIA |
| **Testing Infrastructure**     | ✅ Complete   | Jest, mocks, coverage |
| **Documentation**              | 🚧 60%        | Setup, API, user guides |
| **Error Monitoring**           | ✅ Complete   | Sentry integrated (server & client) |
| **Distributed Caching**        | ✅ Complete   | Redis (Upstash) for AI insights |

---

## 5. MVP Progress Estimate

- **Overall MVP Completion:** **~90%**
- **What's Left for MVP:**
  - Finalize program management UI/UX
  - Complete Stripe live environment setup
  - Polish admin dashboard and analytics
  - Finish resource library and documentation
  - Final QA, bug fixes, and user testing
  - **Finish Google OAuth setup for authentication**

---

## 6. Key Next Steps
- [ ] Finalize and test program management flows
- [ ] Complete Stripe payment setup for production
- [ ] Polish admin and analytics dashboards
- [ ] Add more real data to Firestore for live testing
- [ ] Update and expand documentation
- [ ] Conduct end-to-end QA and user acceptance testing
- [ ] **Finish Google OAuth setup and test login flow**
- [ ] Add E2E tests for AI and authentication flows
- [ ] Document Redis/Sentry setup for future devs

---

**This document is a comprehensive snapshot of the Stripe Coach build as of 18 May. Use it as a reference for current status, architecture, and next steps.** 
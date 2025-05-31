# Sprint Task Prompt: Remove Mock Data & Enable Real Roles

## Objective
Transition the Stripe Coach platform from mock/demo data to live, production-ready data. Ensure real admin, coach, and client roles are seeded, functional, and all dashboards are connected to live data for end-to-end testing.

---

## Instructions for Sprint

### 1. Audit and Remove All Mock Data
- Search the codebase for any use of mock, fake, or hardcoded data (e.g., `mockData`, `fakeData`, `demoData`, or static arrays/objects).
- Replace all mock data sources with real data fetching from Firestore or the production database.
- Remove or refactor any components, hooks, or services that are only used for demo purposes.

### 2. Seed Real Test Users
- Create real test accounts for each role:
  - **Admin**: At least 1 admin user
  - **Coach**: At least 1 coach user
  - **Client**: At least 2 client users
- Ensure each user has appropriate permissions and is assigned realistic data (e.g., programs, check-ins, analytics).
- Document the credentials and test data for QA.

### 3. Enable and Test Role-Based Access
- Verify that all pages and API routes are protected by role-based access control.
- Test login, navigation, and permissions for each role:
  - Admin: Full access to admin dashboard and management tools
  - Coach: Access to coach dashboard, client management, programs, analytics
  - Client: Access to client dashboard, check-ins, assigned programs, resources
- Ensure users cannot access pages or data outside their role.

### 4. Connect Dashboards to Live Data
- Update all dashboard components (admin, coach, client) to fetch and display real data from the database.
- Remove any UI elements that display static or placeholder content.
- Test that all widgets, charts, and tables update dynamically based on real user activity.

### 5. Test All Core Flows End-to-End
- Registration and onboarding for each role
- Login and authentication
- Check-in submission and review
- Program assignment and progress tracking
- Payment and subscription flows
- Analytics and reporting

### 6. Document and Report
- Keep a checklist of all mock data removed and real data sources connected.
- Document any issues, blockers, or areas needing further attention.
- Prepare a summary report at the end of the sprint for stakeholders.

---

## Success Criteria
- No mock or demo data remains in the codebase or UI.
- All dashboards and user flows operate on real, live data.
- Real admin, coach, and client roles are functional and tested.
- All core features are ready for QA and stakeholder review.

---

## Useful Search Terms for Codebase Audit
- `mock`
- `fake`
- `demo`
- `staticData`
- `placeholder`
- `testUser`
- `hardcoded`

---

## End of Sprint Deliverables
- Clean, production-ready codebase
- Real user roles and data in place
- Sprint summary report 
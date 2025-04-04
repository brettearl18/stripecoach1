# Stripe Coach Project: How to Fix Setup Issues

## Initial Setup

1. **Fix Dependency Conflicts**
```bash
# Remove package-lock.json and node_modules
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps due to React 19 conflicts
npm install --legacy-peer-deps
```

## Missing Dependencies

1. **Install Required Packages**
```bash
# Install missing core dependencies
npm install zod @clerk/nextjs firebase --legacy-peer-deps
```

## Firebase Configuration

1. **Set up Firebase Config**
- Create `src/lib/firebase.ts` if it doesn't exist
- Add proper Firebase configuration:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
```

## Environment Variables

1. **Set up Required Environment Variables**
- Copy `.env.example` to `.env.local`
- Fill in the following variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
```

## TypeScript/Linting Issues

1. **Fix Type Errors**
- Run TypeScript check:
```bash
npm run type-check
```

2. **Common Type Fixes**:
- Replace `any` types with proper interfaces
- Add missing type definitions
- Fix React Hook dependency warnings

3. **ESLint Fixes**:
```bash
# Fix auto-fixable issues
npm run lint -- --fix
```

4. **Manual Fixes Needed**:
- Remove unused imports in:
  - `src/app/admin/analytics/page.tsx`
  - `src/app/admin/avatars/new/page.tsx`
  - `src/app/admin/check-ins/page.tsx`
  - Other files with unused variable warnings

## Next.js Configuration

1. **Fix Next.js Config**
- Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
}

module.exports = nextConfig
```

## React Version Conflicts

1. **Option 1: Downgrade React**
```bash
npm install react@18.2.0 react-dom@18.2.0 --save --legacy-peer-deps
```

2. **Option 2: Update Headless UI**
```bash
npm install @headlessui/react@latest --legacy-peer-deps
```

## Build and Verification

1. **Verify Setup**
```bash
# Clear next.js cache
rm -rf .next

# Run development server
npm run dev
```

2. **Check Build**
```bash
npm run build
```

## Common Issues and Solutions

1. **Module Resolution Errors**
- Check import paths are correct
- Ensure all required modules are installed
- Clear `.next` cache if needed

2. **TypeScript Errors**
- Add proper type definitions
- Use specific types instead of `any`
- Fix React Hook dependencies

3. **Firebase Integration**
- Ensure Firebase config is properly set up
- Check environment variables are correctly set
- Verify Firebase project settings

4. **Clerk Authentication**
- Set up Clerk properly in your project
- Ensure Clerk environment variables are set
- Check Clerk configuration in your application

## Additional Notes

1. **Development Best Practices**
- Use TypeScript strict mode
- Avoid using `any` type
- Follow React Hooks rules
- Keep dependencies updated

2. **Performance Considerations**
- Use proper code splitting
- Optimize images and assets
- Implement proper caching strategies

3. **Security**
- Keep environment variables secure
- Implement proper authentication
- Set up proper Firebase security rules

## Support and Resources

- Next.js Documentation: https://nextjs.org/docs
- Firebase Documentation: https://firebase.google.com/docs
- Clerk Documentation: https://clerk.com/docs
- TypeScript Documentation: https://www.typescriptlang.org/docs

# Stripe Coach - Stable Settings Reference

## Quick Reference
- **Branch Name:** `feat/settings-page-improvements`
- **Commit Hash:** `4effc12` (Latest settings improvements)
- **Parent Commit:** `75ba3c5` (Complete settings implementation)
- **Access Command:** `git checkout feat/settings-page-improvements`

## Key Features
1. **Complete Settings UI**
   - Dark mode support
   - Responsive design
   - Modern UI components

2. **Settings Sections**
   - Profile Management
   - External Integrations (Google Calendar, Zoom, Loom)
   - AI Settings & Training
   - Templates & Forms
   - Security & Privacy
   - Billing & Payments
   - Working Hours & Timezone

3. **UI Components**
   - Avatar
   - Switch
   - Tabs
   - Cards
   - ThemeProvider

## Important Files
- `src/app/coach/settings/page.tsx` - Main settings page
- `src/components/ThemeProvider.tsx` - Theme management
- `src/components/ui/avatar.tsx` - Avatar component
- `src/components/ui/switch.tsx` - Switch component
- `src/components/ui/tabs.tsx` - Tabs component
- `src/lib/services/firebaseService.ts` - Firebase integration

## Dependencies
```json
{
  "@radix-ui/react-avatar": "latest",
  "@radix-ui/react-switch": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-label": "latest",
  "lucide-react": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "next-themes": "latest"
}
```

## Recovery Steps
If you need to revert to this version:

1. Stop any running Next.js instances:
   ```bash
   pkill -f "next dev"
   ```

2. Checkout the stable version:
   ```bash
   git checkout feat/settings-page-improvements
   ```

3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Known Working State
- Settings page accessible at: `/coach/settings`
- Dark mode functioning
- All UI components properly styled
- Firebase integration working
- Form submissions operational

## Troubleshooting
If you encounter issues:
1. Check that all dependencies are installed
2. Verify Firebase configuration in `.env.local`
3. Ensure `/src/pages` directory exists
4. Clear Next.js cache if needed: `rm -rf .next`

## Additional Notes
- This version includes comprehensive error handling
- All forms have proper validation
- Integrations are properly typed
- Dark mode persists across sessions
- Mobile-responsive design implemented 
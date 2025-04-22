import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentCheckIcon,
  PhotoIcon,
  ScaleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Coaches', href: '/admin/coaches', icon: UsersIcon },
  { name: 'Clients', href: '/admin/clients', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Programs', href: '/admin/programs', icon: DocumentTextIcon },
  { name: 'Reports', href: '/admin/reports', icon: DocumentDuplicateIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftIcon },
  { name: 'Check-ins', href: '/admin/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Billing', href: '/admin/billing', icon: CreditCardIcon }
];

export const coachNavigation = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/coach/clients', icon: UsersIcon },
  { name: 'Templates', href: '/coach/templates', icon: DocumentTextIcon },
  { name: 'Settings', href: '/coach/settings', icon: Cog6ToothIcon },
  { name: 'Forms', href: '/coach/forms', icon: ClipboardDocumentCheckIcon },
  { name: 'Check-ins', href: '/coach/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Messages', href: '/coach/messages', icon: ChatBubbleLeftIcon },
  { name: 'Analytics', href: '/coach/analytics', icon: ChartBarIcon }
];

export const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
  { name: 'Check-ins', href: '/client/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Photos', href: '/client/photos', icon: PhotoIcon },
  { name: 'Measurements', href: '/client/measurements', icon: ScaleIcon },
  { name: 'Messages', href: '/client/messages', icon: ChatBubbleLeftIcon },
  { name: 'Forms', href: '/client/forms', icon: DocumentTextIcon },
  { name: 'Coach', href: '/client/coach', icon: UserCircleIcon },
  { name: 'Profile', href: '/client/profile', icon: Cog6ToothIcon }
]; 
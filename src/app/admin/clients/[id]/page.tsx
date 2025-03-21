import { Suspense } from 'react';
import ClientProfileContent from './ClientProfileContent';
import { testClients } from '@/lib/test-data';

async function getClient(id: string) {
  // In production, this would be a database call
  return testClients.find(c => c.id === id) || testClients[0];
}

export default async function ClientProfile({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);

  return (
    <Suspense fallback={
      <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading client profile...
        </div>
      </div>
    }>
      <ClientProfileContent client={client} />
    </Suspense>
  );
} 
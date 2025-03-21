import TestPayment from '@/components/TestPayment';

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Stripe Payment Test
          </h1>
          <div className="bg-white shadow rounded-lg">
            <TestPayment />
          </div>
        </div>
      </div>
    </div>
  );
} 
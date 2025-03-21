import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AddClientModal({ isOpen, onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchStripeCustomer = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/stripe/search-customer?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setSearchResults(data);
      if (data.customer) {
        setName(data.customer.name || '');
        setStripeCustomerId(data.customer.id);
      }
    } catch (err) {
      setError('Failed to search for customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          stripeCustomerId,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      onAdd(data);
      onClose();
    } catch (err) {
      setError('Failed to create client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
              Add New Client
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={searchStripeCustomer}
                  disabled={isLoading || !email}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search
                </button>
              </div>
            </div>

            {searchResults && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">
                  Stripe Customer Details
                </h3>
                {searchResults.customer ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Name:</span> {searchResults.customer.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Customer Since:</span>{' '}
                      {new Date(searchResults.customer.created * 1000).toLocaleDateString()}
                    </p>
                    {searchResults.paymentHistory && (
                      <div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Payment History:</span>{' '}
                          {searchResults.paymentHistory.total_payments} payments totaling{' '}
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(searchResults.paymentHistory.total_amount / 100)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No existing customer found with this email.</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!name || !email)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 
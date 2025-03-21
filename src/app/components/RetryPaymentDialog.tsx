import { Dialog } from '@headlessui/react';
import { CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface RetryPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethodId: string) => Promise<void>;
  clientName: string;
  amount: number;
  paymentMethods: PaymentMethod[];
}

export default function RetryPaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  amount,
  paymentMethods,
}: RetryPaymentDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    paymentMethods[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(selectedPaymentMethod);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCard = (card: PaymentMethod['card']) => {
    return `${card.brand.toUpperCase()} •••• ${card.last4} (${card.exp_month}/${card.exp_year})`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.1)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-amber-100 p-3 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <Dialog.Title className="text-xl font-semibold text-slate-900">
                Retry Payment
              </Dialog.Title>
              <p className="text-sm text-slate-600 mt-1">
                You are about to retry a payment for {clientName}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount to Charge
              </label>
              <div className="text-2xl font-semibold text-slate-900">
                ${(amount / 100).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        {formatCard(method.card)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing || !selectedPaymentMethod}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Retry'
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 
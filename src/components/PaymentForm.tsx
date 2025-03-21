'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message ?? 'An error occurred');
        setPaymentSuccess(false);
      } else {
        setErrorMessage(null);
        setPaymentSuccess(true);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      setPaymentSuccess(false);
    }

    setIsProcessing(false);
  };

  if (paymentSuccess) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        Payment successful! Thank you for your purchase.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
} 
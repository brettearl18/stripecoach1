'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function TestPayment() {
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleTestPayment = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // $10.00
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError('Failed to create payment intent');
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Test Stripe Payment</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!clientSecret ? (
        <button
          onClick={handleTestPayment}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Make Test Payment ($10)
        </button>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm />
        </Elements>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Test Card Numbers:</h3>
        <ul className="space-y-2 text-gray-600">
          <li>Success: 4242 4242 4242 4242</li>
          <li>Requires Auth: 4000 0025 0000 3155</li>
          <li>Decline: 4000 0000 0000 9995</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Use any future expiration date, any 3-digit CVC, and any postal code.
        </p>
      </div>
    </div>
  );
} 
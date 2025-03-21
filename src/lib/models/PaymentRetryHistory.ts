export interface PaymentRetryHistory {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  originalPaymentId: string;
  retryPaymentId: string;
  status: 'succeeded' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  paymentMethodId: string;
  paymentMethodDetails: {
    brand: string;
    last4: string;
  };
  timestamp: Date;
  retriedBy: string;
}

export interface CreatePaymentRetryHistoryInput {
  clientId: string;
  clientName: string;
  amount: number;
  originalPaymentId: string;
  retryPaymentId: string;
  status: PaymentRetryHistory['status'];
  errorCode?: string;
  errorMessage?: string;
  paymentMethodId: string;
  paymentMethodDetails: PaymentRetryHistory['paymentMethodDetails'];
  retriedBy: string;
} 
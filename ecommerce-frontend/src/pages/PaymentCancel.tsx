import React from 'react';
import { Seo } from '../seo/Seo';

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Seo title="Payment cancelled" noindex canonicalPath="/payment/cancel" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-500">Your payment was cancelled</p>
      </div>
    </div>
  );
};

export default PaymentCancel; 
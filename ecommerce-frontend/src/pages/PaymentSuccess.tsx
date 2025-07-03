import React from 'react';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-500">Thank you for your purchase</p>
      </div>
    </div>
  );
};

export default PaymentSuccess; 
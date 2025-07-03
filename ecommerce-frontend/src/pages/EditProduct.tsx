import React from 'react';
import { useParams } from 'react-router-dom';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit Product</h1>
        <p className="text-gray-600">Product ID: {id}</p>
        <p className="text-gray-500 mt-2">This page is under construction</p>
      </div>
    </div>
  );
};

export default EditProduct; 
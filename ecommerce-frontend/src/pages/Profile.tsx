import React from 'react';
import { Seo } from '../seo/Seo';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Seo title="Profile" noindex canonicalPath="/profile" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
        <p className="text-gray-500">This page is under construction</p>
      </div>
    </div>
  );
};

export default Profile; 
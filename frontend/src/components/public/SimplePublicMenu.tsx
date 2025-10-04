import React from 'react';
import { useParams } from 'react-router-dom';

const SimplePublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  console.log('SimplePublicMenu: Component loaded with slug:', slug);
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Simple Menu Test
        </h1>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Route Information</h2>
          <p className="text-lg mb-2">
            <strong>Slug:</strong> {slug || 'No slug provided'}
          </p>
          <p className="text-lg mb-2">
            <strong>URL:</strong> {window.location.href}
          </p>
          <p className="text-lg mb-4">
            <strong>Timestamp:</strong> {new Date().toISOString()}
          </p>
          
          <div className="mt-6 p-4 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold mb-2">Test Content</h3>
            <p className="text-gray-700">
              If you can see this, the routing is working! The component is rendering successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePublicMenu;

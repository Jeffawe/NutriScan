import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage : React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Discover What's in Your Food
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get detailed nutritional information, ingredient analysis, and track changes 
            in your favorite food products
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg 
                     shadow-lg transform transition hover:scale-105"
          >
            Start Analyzing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage
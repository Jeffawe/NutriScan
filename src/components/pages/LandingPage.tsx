import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScannerSVG from './svg/ScannerSVG';
import NutritionScannerIcon from './svg/NutritionScannerIcon';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-300">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <NutritionScannerIcon />
            <span className="text-2xl font-bold text-green-600">ScanMyFood</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-green-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-green-600 transition">How It Works</a>
            <button
              onClick={() => navigate('/search')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Search Foods
            </button>
          </div>
          <div className="md:hidden">
            <button className="text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left md:pr-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What's Really in Your Food?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Scan food items by name or image and get detailed nutritional information instantly. Make healthier choices with data from the US Food Database.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <button
                onClick={() => navigate('/search')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg 
                          shadow-lg transform transition hover:scale-105"
              >
                Start Scanning
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <ScannerSVG />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-lg p-6 shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Image Scanning</h3>
              <p className="text-gray-600 text-center">Scan food items with your camera for instant nutritional information</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Comprehensive Data</h3>
              <p className="text-gray-600 text-center">Access detailed nutritional profiles from the US Food Database</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Track Changes</h3>
              <p className="text-gray-600 text-center">Monitor nutritional changes in your favorite products over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How ScanMyFood Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="flex flex-col items-center max-w-xs text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search or Scan</h3>
              <p className="text-gray-600">Enter a food name or scan an item with your camera</p>
            </div>
            <div className="flex flex-col items-center max-w-xs text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze Data</h3>
              <p className="text-gray-600">Our system processes and retrieves detailed nutritional information</p>
            </div>
            <div className="flex flex-col items-center max-w-xs text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Better Choices</h3>
              <p className="text-gray-600">Use the detailed nutritional breakdown to inform your food decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-300 text-white py-8 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <NutritionScannerIcon />
              <span className="text-xl font-bold text-white">ScanMyFood</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-black">
                Developed by{" "}
                <a
                  href="https://www.jeffawe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-green-600 underline"
                >
                  Jeffery Ozoekwe Awagu
                </a>
              </p>
              <p className="text-black text-sm mt-2">© {new Date().getFullYear()} NutriScan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
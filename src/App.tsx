import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import SearchPage from './components/pages/SearchPage';
import { FoodProvider } from './components/FoodContext';
import FoodNutritionDisplay from './components/pages/NutritionDisplay';
import { Analytics } from "@vercel/analytics/react"
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    // Wake the backend early (free hosting sleeps when idle) so the first search is fast.
    // Uptime alerts belong in an external monitor (e.g. UptimeRobot on /health/), not here:
    // anything in the frontend bundle — like a Discord webhook URL — is public.
    const backendUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/health/`).catch(() => {
        // Ignore: this is only a warm-up ping
      });
    }
  }, []);

  return (
    <FoodProvider>
      <Router>
        <div className='w-full bg-gradient-to-b from-green-50 to-white'>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/food/:id" element={<FoodNutritionDisplay />} />
            <Route path="/product/:barcode" element={<FoodNutritionDisplay />} />
          </Routes>
        </div>
      </Router>
      <Analytics />
    </FoodProvider>
  );
}

export default App;

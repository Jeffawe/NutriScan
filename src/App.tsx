import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import SearchPage from './components/pages/SearchPage';
import { FoodProvider } from './components/FoodContext';
import FoodNutritionDisplay from './components/pages/NutritionDisplay';
import { Analytics } from "@vercel/analytics/react"
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/health/`);

        if (!response.ok) {
          // Backend is up but returning an error
          sendDiscordAlert(`Backend is up but returning status ${response.status}`);
          return;
        }

      } catch (error: unknown) {
        // Type narrowing for the error object
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = String(error);
        }

        sendDiscordAlert(`Backend is down: ${errorMessage}`);
      }
    };

    const sendDiscordAlert = async (message: string) => {
      try {
        // Replace with your Discord webhook URL
        const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `🚨 **ScanMyFood Alert**: ${message}`,
            username: 'NutriScan Monitor',
          }),
        });

      } catch (error) {
        console.error("Failed to send Discord alert");
      }
    };

    // Run the health check when the app starts
    checkBackendHealth();
  }, []);

  return (
    <FoodProvider>
      <Router>
        <div className='w-full bg-gradient-to-b from-green-50 to-white'>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/food/:id" element={<FoodNutritionDisplay />} />
          </Routes>
        </div>
      </Router>
      <Analytics />
    </FoodProvider>
  );
}

export default App;
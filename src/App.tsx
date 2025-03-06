import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import SearchPage from './components/pages/SearchPage';
import { FoodProvider } from './components/FoodContext';
import FoodNutritionDisplay from './components/pages/NutritionDisplay';
import { Analytics } from "@vercel/analytics/react"

const App = () => {
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
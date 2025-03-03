import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodData } from './types';

interface FoodContextType {
    selectedFood: FoodData | null;
    setSelectedFood: (food: FoodData | null) => void;
    clearSelectedFood: () => void;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

interface FoodProviderProps {
    children: ReactNode;
}

export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
    const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);

    const clearSelectedFood = () => {
        setSelectedFood(null);
    };

    // The value that will be given to the context
    const value = {
        selectedFood,
        setSelectedFood,
        clearSelectedFood
    };

    return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFoodContext = (): FoodContextType => {
    const context = useContext(FoodContext);
    if (context === undefined) {
        throw new Error('useFoodContext must be used within a FoodProvider');
    }
    return context;
};
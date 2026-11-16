import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodData, SearchState } from './types';

export const EMPTY_SEARCH_STATE: SearchState = {
    results: null,
    pages: 1,
    currentPage: 1,
    searchText: '',
};

interface FoodContextType {
    selectedFood: FoodData | null;
    setSelectedFood: (food: FoodData | null) => void;
    clearSelectedFood: () => void;
    // Lives above the router so search results survive navigating to a food and back
    searchState: SearchState;
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

interface FoodProviderProps {
    children: ReactNode;
}

export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
    const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
    const [searchState, setSearchState] = useState<SearchState>(EMPTY_SEARCH_STATE);

    const clearSelectedFood = () => {
        setSelectedFood(null);
    };

    const value = {
        selectedFood,
        setSelectedFood,
        clearSelectedFood,
        searchState,
        setSearchState,
    };

    return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFoodContext = (): FoodContextType => {
    const context = useContext(FoodContext);
    if (context === undefined) {
        throw new Error('useFoodContext must be used within a FoodProvider');
    }
    return context;
};

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FoodData } from '../types';
import { useFoodContext } from '../FoodContext';

interface FoodListProps {
    foodItems: FoodData[];
}

const FoodList: React.FC<FoodListProps> = ({ foodItems = [] }) => {
    const navigate = useNavigate();
    const { setSelectedFood } = useFoodContext();

    const handleFoodItemClick = (food : FoodData) => {
        setSelectedFood(food);
        navigate(`/food/${food.basic_info.id}`);
    };

    // Helper function to get badge color based on highlight content
    const getBadgeColor = (highlight: string): string => {
        if (highlight.includes('Low') || highlight.includes('Good')) {
            return 'bg-green-100 text-green-800';
        } else if (highlight.includes('High') && !highlight.includes('protein')) {
            return 'bg-yellow-100 text-yellow-800';
        } else if (highlight.includes('High protein')) {
            return 'bg-blue-100 text-blue-700';
        }
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Food Items</h2>
            
            {!Array.isArray(foodItems) || foodItems.length === 0 ? (
                <p className="text-gray-500">No food items available</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {foodItems.map((food, index) => (
                        <Card 
                            key={`${food.basic_info.id || index}`}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleFoodItemClick(food)}
                        >
                            <CardContent className="p-4">
                                <div>
                                    <h3 className="font-medium text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                                        {food.basic_info.name}
                                    </h3>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-500 mb-2">
                                            {food.basic_info.brand || 'Unknown Brand'}
                                        </p>
                                        {food.basic_info.calories !== undefined && (
                                            <div>
                                                <span className="text-lg font-semibold">
                                                    {food.basic_info.calories}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">cal</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {food.basic_info.serving_size && food.basic_info.serving_unit && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Serving: {food.basic_info.serving_size} {food.basic_info.serving_unit}
                                        {food.basic_info.household_serving && ` (${food.basic_info.household_serving})`}
                                    </p>
                                )}
                                
                                <div className="text-sm mb-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {food.nutrients.macronutrients.slice(0, 3).map((nutrient) => (
                                            <div key={nutrient.name} className="text-center">
                                                <div className="font-semibold">{nutrient.amount}{nutrient.unit}</div>
                                                <div className="text-xs text-gray-500">
                                                    {nutrient.name.split(',')[0].replace('Total lipid', 'Fat')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {food.analysis.key_highlights.slice(0, 3).map((highlight, i) => (
                                        <Badge 
                                            key={i} 
                                            className={`text-xs ${getBadgeColor(highlight)}`}
                                            variant="outline"
                                        >
                                            {highlight}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FoodList;
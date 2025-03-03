import React, { useEffect, useState } from 'react';
import { Info, AlertCircle, Clock, Utensils, BarChart, Tag, Package, HelpCircle, ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_FOOD_DATA, FoodData, NutrientDisplayProps } from '../types';
import { useFoodContext } from '../FoodContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const BASE_URL = import.meta.env.VITE_BASE_URL

// Map of abbreviated units to full unit names
const UNIT_DISPLAY_MAP: Record<string, string> = {
    'g': 'grams',
    'mg': 'milligrams',
    'mcg': 'micrograms',
    'IU': 'International Units',
    'kcal': 'kilocalories',
    'oz': 'ounces',
    'ml': 'milliliters',
    'tbsp': 'tablespoons',
    'tsp': 'teaspoons',
    'µg': 'micrograms'
};

// Format unit for display
const formatUnit = (unit: string): string => {
    return UNIT_DISPLAY_MAP[unit] || unit;
};

const NutrientDisplay: React.FC<NutrientDisplayProps> = ({ name, amount, unit, daily_value_percent }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="text-gray-700">{name}</span>
        <div className="flex items-center gap-3">
            <span className="font-semibold">
                {amount} {unit}
            </span>
            {daily_value_percent !== undefined && daily_value_percent > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">
                                {daily_value_percent}% DV
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">Daily Value (DV) shows what percentage of your recommended daily intake this serving provides. For example, 20% DV means this serving provides 20% of what you should consume for that nutrient in a day.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    </div>
);

// Colors for the pie charts
const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const MacroDonutChart: React.FC<{ carbs?: number; protein?: number; fat?: number }> = ({ carbs, protein, fat }) => {
    if (!carbs && !protein && !fat) return null;

    const data = [
        { name: 'Carbs', value: carbs || 0, color: '#3b82f6' },
        { name: 'Protein', value: protein || 0, color: '#10b981' },
        { name: 'Fat', value: fat || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    const totalCalories = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex justify-center items-center my-4">
            <div className="w-32 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = 25 + (outerRadius - innerRadius);
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor={x > cx ? 'start' : 'end'}
                                        dominantBaseline="central"
                                        className="text-xs"
                                    >
                                        {`${Math.round(value)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            formatter={(value, name) => [`${Math.round(Number(value))}%`, name]}
                            contentStyle={{ borderRadius: '4px', padding: '8px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500">Calories</span>
                    <span className="font-bold text-lg">{Math.round(totalCalories) || "N/A"}</span>
                </div>
            </div>

            <div className="flex flex-col gap-1 ml-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm cursor-help">{item.name}: {Math.round(item.value)}%</span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>
                                        {item.name === 'Carbs' && 'Carbohydrates provide energy for your body'}
                                        {item.name === 'Protein' && 'Protein is essential for building and repairing tissues'}
                                        {item.name === 'Fat' && 'Fats are important for nutrient absorption and cell growth'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MineralsChart: React.FC<{ minerals?: any[] }> = ({ minerals }) => {
    if (!minerals || minerals.length === 0) return null;

    // Filter minerals with DV percentage and sort by percentage
    const chartData = minerals
        .filter(mineral => mineral.daily_value_percent !== undefined && mineral.daily_value_percent > 0)
        .sort((a, b) => b.daily_value_percent - a.daily_value_percent)
        .slice(0, 6); // Top 6 minerals

    if (chartData.length === 0) return null;

    return (
        <div className="w-full h-64 mt-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                Key Minerals (% of Daily Value)
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle size={14} className="ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">
                                Daily Value (DV) is the recommended daily amount of a nutrient.
                                This chart shows how much of your daily needs this food provides for each mineral.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <RechartsTooltip
                        formatter={(value, name, props) => [
                            `${value}% of daily recommended intake`,
                            props.payload.name
                        ]}
                        contentStyle={{ borderRadius: '4px', padding: '8px' }}
                    />
                    <Bar
                        dataKey="daily_value_percent"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    >
                        {chartData.map((index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Help tooltip component for common terms
const HelpTooltip: React.FC<{ term: string, children?: React.ReactNode }> = ({ term, children }) => {
    const getTooltipContent = () => {
        switch (term) {
            case 'serving size':
                return "The amount of food typically consumed in one eating occasion.";
            case 'calories':
                return "A measure of energy that food provides to your body.";
            case 'macronutrients':
                return "The three main nutrients your body needs in larger amounts: carbohydrates, protein, and fats.";
            case 'vitamins':
                return "Essential organic compounds that your body needs in small amounts for proper function.";
            case 'minerals':
                return "Inorganic elements that your body needs to maintain proper function and health.";
            case 'dv':
                return "Daily Value (DV) shows what percentage of your recommended daily intake this serving provides. For example, 20% DV means this serving provides 20% of what you should consume for that nutrient in a day.";
            default:
                return children || "Additional information about this term.";
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className='bg-transparent border-none'>
                    <HelpCircle size={14} className="text-gray-400 bg-transparent" />
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{getTooltipContent()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

// DV Explanation card component
const DVExplanationCard: React.FC = () => (
    <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
                <Info size={18} className="text-blue-600 mr-2" />
                What does "DV" mean?
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm">
                <strong>DV stands for "Daily Value"</strong> - it shows what percentage of your daily recommended intake this food provides for each nutrient.
            </p>
            <p className="text-sm mt-2">
                For example, if calcium shows "15% DV", it means one serving of this food provides 15% of the calcium you should consume in a day.
            </p>
            <p className="text-sm mt-2">
                Daily Values are based on a 2,000 calorie daily diet for the average adult. Your personal needs may vary based on your age, gender, weight, activity level, and health goals.
            </p>
        </CardContent>
    </Card>
);

const FoodNutritionDisplay: React.FC = () => {
    const { id } = useParams() as { id: string };
    const { selectedFood } = useFoodContext();
    const navigate = useNavigate();

    const [foodData, setFoodData] = useState<FoodData>(selectedFood || DEFAULT_FOOD_DATA);
    const [showDVExplanation, setShowDVExplanation] = useState(false);
    const basic_info = foodData.basic_info;
    const nutrients = foodData.nutrients;
    const analysis = foodData.analysis;

    const fetchFoodData = async (): Promise<FoodData> => {
        try {
            const response = await axios.get(`${BASE_URL}/analyze-food/?fcID=${id}`)
            return response.data as FoodData;
        } catch (error) {
            console.error("Error fetching food data:", error);
            return DEFAULT_FOOD_DATA;
        }
    };

    useEffect(() => {
        if (!selectedFood) {
            fetchFoodData().then(setFoodData);
        }
    }, [selectedFood])

    // Check if there are nutrients in each category
    const hasNutrients = (category: keyof typeof foodData.nutrients) =>
        foodData.nutrients[category] && foodData.nutrients[category].length > 0;

    // Handler for back button
    const handleGoBack = () => {
        navigate('/search'); // Navigate to the previous page in history
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
            <div className='flex flex-row items-center'>
                {/* Back button */}
                <Button
                    size="sm"
                    onClick={handleGoBack}
                    className="bg-transparent hover:bg-transparent hover:text-gray-600"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Search
                </Button>

                <div>
                    <HelpCircle size={20} onClick={() => setShowDVExplanation(!showDVExplanation)} className=" text-gray-400 bg-transparent" />
                </div>
            </div>

            {/* DV Explanation Card */}
            {showDVExplanation &&
                <DVExplanationCard />
            }

            {/* Basic Information */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Info size={20} />
                        {foodData.basic_info.name}
                    </CardTitle>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Package size={14} />
                        <span>{foodData.basic_info.brand}</span>
                        {foodData.basic_info.category && (
                            <>
                                <span className="mx-1">•</span>
                                <Tag size={14} />
                                <span>{foodData.basic_info.category}</span>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Utensils size={14} />
                                Serving Size
                                <HelpTooltip term="serving size" />
                            </p>
                            <p className="font-medium">
                                {basic_info.household_serving ||
                                    (basic_info.serving_size && basic_info.serving_unit ?
                                        `${basic_info.serving_size} ${formatUnit(basic_info.serving_unit)}` :
                                        'Not specified')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <BarChart size={14} />
                                Calories
                                <HelpTooltip term="calories" />
                            </p>
                            <p className="font-bold text-lg">
                                {basic_info.calories !== null ? `${basic_info.calories} ${formatUnit('kcal')}` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Nutritional profile visualization */}
                    <MacroDonutChart
                        carbs={analysis.nutritional_profile.carbs_calories_percent}
                        protein={analysis.nutritional_profile.protein_calories_percent}
                        fat={analysis.nutritional_profile.fat_calories_percent}
                    />

                    {/* Minerals chart */}
                    {hasNutrients('minerals') && (
                        <MineralsChart minerals={nutrients.minerals} />
                    )}

                    {/* Key highlights */}
                    {analysis.key_highlights && analysis.key_highlights.length > 0 && (
                        <div className="mt-15">
                            <div className="flex flex-wrap gap-2">
                                {analysis.key_highlights.map((highlight, index) => (
                                    <Badge key={index} variant="secondary">
                                        {highlight}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                {basic_info.ingredients && (
                    <CardFooter className="border-t pt-4 pb-0">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ingredients:</p>
                            <p className="text-sm text-gray-600 mt-1">{basic_info.ingredients}</p>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* Nutritional Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        Nutritional Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Only show categories that have nutrients */}
                        {hasNutrients('macronutrients') && (
                            <div>
                                <h3 className="text-lg font-semibold capitalize mb-3 flex items-center">
                                    Macronutrients
                                    <HelpTooltip term="macronutrients" />
                                </h3>
                                <div className="space-y-2">
                                    {nutrients.macronutrients.map((nutrient, index) => (
                                        <NutrientDisplay
                                            key={index}
                                            {...nutrient}
                                            unit={formatUnit(nutrient.unit)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasNutrients('vitamins') && (
                            <div>
                                <h3 className="text-lg font-semibold capitalize mb-3 flex items-center">
                                    Vitamins
                                    <HelpTooltip term="vitamins" />
                                </h3>
                                <div className="space-y-2">
                                    {nutrients.vitamins.map((nutrient, index) => (
                                        <NutrientDisplay
                                            key={index}
                                            {...nutrient}
                                            unit={formatUnit(nutrient.unit)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasNutrients('minerals') && (
                            <div>
                                <h3 className="text-lg font-semibold capitalize mb-3 flex items-center">
                                    Minerals
                                    <HelpTooltip term="minerals" />
                                </h3>
                                <div className="space-y-2">
                                    {nutrients.minerals.map((nutrient, index) => (
                                        <NutrientDisplay
                                            key={index}
                                            {...nutrient}
                                            unit={formatUnit(nutrient.unit)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasNutrients('other') && (
                            <div>
                                <h3 className="text-lg font-semibold capitalize mb-3">
                                    Other Nutrients
                                </h3>
                                <div className="space-y-2">
                                    {nutrients.other.map((nutrient, index) => (
                                        <NutrientDisplay
                                            key={index}
                                            {...nutrient}
                                            unit={formatUnit(nutrient.unit)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Health Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        Health Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {analysis.health_metrics.is_low_fat && (
                            <p className="text-green-600 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 p-1 rounded-full">✓</span>
                                Low in fat
                            </p>
                        )}
                        {analysis.health_metrics.is_low_sodium && (
                            <p className="text-green-600 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 p-1 rounded-full">✓</span>
                                Low in sodium
                            </p>
                        )}
                        {analysis.health_metrics.is_high_fiber && (
                            <p className="text-green-600 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 p-1 rounded-full">✓</span>
                                Good source of fiber
                            </p>
                        )}
                        {analysis.health_metrics.is_low_calorie && (
                            <p className="text-green-600 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 p-1 rounded-full">✓</span>
                                Low calorie
                            </p>
                        )}
                        {analysis.health_metrics.is_high_protein && (
                            <p className="text-green-600 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 p-1 rounded-full">✓</span>
                                Good source of protein
                            </p>
                        )}

                        {/* If no positive health metrics, show default message */}
                        {!Object.values(analysis.health_metrics).some(value => value) && (
                            <p className="text-gray-600">
                                No specific health benefits identified.
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    Data published: {basic_info.published_date || 'Unknown date'}
                </CardFooter>
            </Card>
        </div>
    );
};

export default FoodNutritionDisplay;
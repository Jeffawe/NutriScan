import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { FoodData } from '../types';
import FoodList from './FoodList';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
    const [searchText, setSearchText] = useState('');
    const [id, setID] = useState<number | null>(null);
    const [manyFoodData, setManyFoodData] = useState<FoodData[] | null>(null);
    const [pages, setPages] = useState(1);
    const [isSearchById, setIsSearchById] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useOCR, setUseOCR] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [loadingDelay, setLoadingDelay] = useState(0);

    const navigate = useNavigate();

    // Custom toggle component
    const ToggleSwitch = ({
        checked,
        onChange,
        id
    }: {
        checked: boolean,
        onChange: () => void,
        id: string
    }) => (
        <label
            htmlFor={id}
            className="flex items-center cursor-pointer"
        >
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                <div
                    className={`w-10 h-4 rounded-full shadow-inner transition-colors duration-300 
                    ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <div
                    className={`dot absolute left-0 top-1/2 transform -translate-y-1/2 
                    w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 
                    ${checked ? 'translate-x-full' : 'translate-x-0'}`}
                ></div>
            </div>
        </label>
    );

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('image', file);
            formData.append('use_OCR', useOCR.toString());

            const response = await axios.post(`${BASE_URL}/analyze-image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.data && Array.isArray(response.data.data)) {
                setManyFoodData(response.data.data);
                setPages(response.data.totalPages);
                setSearchText(response.data.searchTerm);
                if (response.data.hasOwnProperty('use_llm')) {
                    if (!response.data.use_llm) {
                        setError('Switching to a lower-tier model due to usage limits.');
                    }
                }
            }
        } catch (error) {
            setError('Failed to analyze image. Please try again.');
        } finally {
            setIsLoading(false);
            // Reset the input value to allow selecting the same file again
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchText.trim()) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/analyze-many-food/?name=${searchText}`);
            setManyFoodData(response.data.data);
            setPages(response.data.totalPages);
        } catch (error) {
            setError('Failed to find food with that name. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextPage = async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(
                `${BASE_URL}/analyze-many-food/?name=${searchText}&page=${page}`
            );
            setManyFoodData(response.data.data);
            setPages(response.data.totalPages);
        } catch (error) {
            setError('Failed to load page. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSearchById || !id) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/analyze-food/?fcID=${id}`);
            const result = [response.data as FoodData];
            setManyFoodData(result);
        } catch (error) {
            setError('Failed to find food with that ID. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const openCamera = () => {
        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    const resetSearch = () => {
        setManyFoodData(null);
        setSearchText('');
        setID(null);
        setError(null);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingDelay((prev) => prev + 1);
            }, 1000);
        } else {
            setLoadingDelay(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const getLoadingMessage = () => {
        if (loadingDelay < 5) return "Firing up the servers... 🔌🔥";
        if (loadingDelay < 10) return "Still preheating the servers... hang tight! 🔥";
        if (loadingDelay < 20) return "Slow-roasting the nutrition facts... almost ready! 🥘";
        return "Server is heating up... 🍳";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-green-600 hover:text-green-700"
                    >
                        <ArrowLeft size={20} className="mr-1" />
                        <span>Back</span>
                    </button>
                </div>

                <h2 className="text-3xl font-bold text-center mb-8">
                    Analyze Your Food
                </h2>

                {error && (
                    <div className="bg-red-50 border-l-4 flex border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                        <div className='ml-auto'><X size={24} className='text-red-700 cursor-pointer' onClick={() => setError(null)} /></div>
                    </div>
                )}

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    id="camera-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                <form onSubmit={isSearchById ? handleSingleSearch : handleSearch} className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-1 bg-white rounded-lg shadow-md">
                            <div className="flex items-center pl-4 text-gray-500">
                                <Search size={20} />
                            </div>
                            <input
                                type={isSearchById ? "number" : "text"}
                                value={isSearchById ? id ?? "" : searchText}
                                onChange={(e) =>
                                    isSearchById ? setID(Number(e.target.value)) : setSearchText(e.target.value)
                                }
                                placeholder={isSearchById ? "Enter product FDCID..." : "Enter product name..."}
                                className="flex-1 p-3 border-none rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 
                                rounded-lg font-semibold flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            ) : (
                                <Search size={20} className="mr-2" />
                            )}
                            Search
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 ml-2">
                        <div className="flex items-center gap-2 relative group">
                            <ToggleSwitch
                                id="searchById"
                                checked={isSearchById}
                                onChange={() => setIsSearchById(!isSearchById)}
                            />
                            <label htmlFor="searchById" className="flex items-center text-gray-700 cursor-pointer">
                                Search by FDCID
                                <span className="ml-2 cursor-help">
                                    <HelpCircle
                                        size={16}
                                        className="text-gray-500 hover:text-gray-700"
                                    />
                                </span>
                            </label>
                            {/* Tooltip */}
                            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                    pointer-events-none">
                                <p>FDCID is a unique identifier for food items in the USDA Food Data Central database.</p>
                                <p className="mt-2 text-xs text-gray-300">
                                    Use this to search for a specific food by its exact database reference number.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative group">
                            <ToggleSwitch
                                id="useOCR"
                                checked={useOCR}
                                onChange={() => setUseOCR(!useOCR)}
                            />
                            <label
                                htmlFor="useOCR"
                                className="flex items-center text-gray-700 cursor-pointer"
                            >
                                Use OCR
                                <span className="ml-2 cursor-help">
                                    <HelpCircle
                                        size={16}
                                        className="text-gray-500 hover:text-gray-700"
                                    />
                                </span>
                            </label>

                            {/* Tooltip */}
                            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                    pointer-events-none">
                                <p>Optical Character Recognition (OCR) helps extract text from images.</p>
                                <p className="mt-2 text-xs text-gray-300">
                                    Enable this to automatically read food labels or menus when uploading an image. Use this when dealing with Products
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {manyFoodData ? (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Results</h3>
                            <button
                                onClick={resetSearch}
                                className="text-green-600 hover:text-green-700 flex items-center"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                New Search
                            </button>
                        </div>
                        <FoodList foodItems={manyFoodData} pages={pages} handleNextPage={handleNextPage} />
                    </div>
                ) : (
                    <div>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
                                <p className="text-sm text-gray-600">{getLoadingMessage()}</p>
                            </div>
                        ) : (
                            <div>
                                {/* Upload and Scan Options */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Upload Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Upload Food Image</h3>
                                        <div className="mb-4">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                                                border-2 border-dashed border-green-300 flex flex-col items-center"
                                            >
                                                <Upload size={48} className="text-green-600 mb-4" />
                                                <span className="text-gray-600">Click to upload image</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Camera Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Use Camera</h3>
                                        <button
                                            onClick={openCamera}
                                            type="button"
                                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                                                border-2 border-dashed border-green-300 flex flex-col items-center"
                                        >
                                            <Camera size={48} className="text-green-600 mb-4" />
                                            <span className="text-gray-600">
                                                Take a picture
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* How to use section */}
                                <div className="mt-12 bg-white p-6 rounded-xl shadow-md">
                                    <h3 className="text-xl font-semibold mb-4">How to Use NutriScan</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                                <span className="text-xl font-bold text-green-600">1</span>
                                            </div>
                                            <h4 className="font-medium mb-1">Search or Scan</h4>
                                            <p className="text-gray-600 text-sm">Search by name or take a picture of your food item</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                                <span className="text-xl font-bold text-green-600">2</span>
                                            </div>
                                            <h4 className="font-medium mb-1">View Results</h4>
                                            <p className="text-gray-600 text-sm">See detailed nutritional information</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                                <span className="text-xl font-bold text-green-600">3</span>
                                            </div>
                                            <h4 className="font-medium mb-1">Make Better Choices</h4>
                                            <p className="text-gray-600 text-sm">Use data to inform your nutrition decisions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
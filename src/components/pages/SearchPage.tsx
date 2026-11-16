import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { Camera, Upload, X, Search, ArrowLeft, HelpCircle, Barcode } from 'lucide-react';
import axios from 'axios';
import { FoodData } from '../types';
import FoodList from './FoodList';
import { useNavigate } from 'react-router-dom';
import { EMPTY_SEARCH_STATE, useFoodContext } from '../FoodContext';

// The barcode library is large, so it's only downloaded when someone actually scans
const BarcodeScanner = lazy(() => import('../BarcodeScanner'));

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Don't let a request spin forever if the server or network stalls
axios.defaults.timeout = 30000;

/** Prefer the backend's own error message (e.g. rate limit / not found) over a generic one. */
const errorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string; message?: string } | undefined;
        if (data?.message) return data.message;
        if (data?.error) return data.error;
        if (!err.response) {
            return err.code === 'ECONNABORTED'
                ? 'The server took too long to respond. Please try again.'
                : "Can't reach ScanMyFood right now. Check your connection and try again.";
        }
        if (err.response.status === 429) return 'Too many requests. Please wait a moment and try again.';
        if (err.response.status >= 500) return 'ScanMyFood is busy right now. Please try again shortly.';
    }
    return fallback;
};

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

const SearchPage = () => {
    const { searchState, setSearchState, setSelectedFood } = useFoodContext();
    const { results: manyFoodData, pages, currentPage, searchText } = searchState;

    const [id, setID] = useState<number | null>(null);
    const [isSearchById, setIsSearchById] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [useOCR, setUseOCR] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [loadingDelay, setLoadingDelay] = useState(0);

    const navigate = useNavigate();

    const setSearchText = (text: string) => setSearchState((prev) => ({ ...prev, searchText: text }));

    const showResults = (results: FoodData[], totalPages: number, text?: string, page = 1) => {
        setSearchState((prev) => ({
            results,
            pages: totalPages || 1,
            currentPage: page,
            searchText: text ?? prev.searchText,
        }));
    };

    const lookupBarcode = useCallback(async (barcode: string) => {
        setShowScanner(false);
        try {
            setIsLoading(true);
            setError(null);
            setNotice(null);
            const response = await axios.get(`${BASE_URL}/barcode/`, { params: { code: barcode } });
            setSelectedFood(response.data as FoodData);
            navigate(`/product/${barcode}`);
        } catch (err) {
            setError(errorMessage(err, `Couldn't look up barcode ${barcode}. Please try again.`));
        } finally {
            setIsLoading(false);
        }
    }, [navigate, setSelectedFood]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);
            setNotice(null);

            // If the photo has a readable barcode, an exact product lookup beats guessing from the picture
            const { decodeBarcodeFromFile } = await import('../BarcodeScanner');
            const barcode = await decodeBarcodeFromFile(file);
            if (barcode) {
                await lookupBarcode(barcode);
                return;
            }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('use_OCR', useOCR.toString());

            const response = await axios.post(`${BASE_URL}/analyze-image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 75000, // upload + up to two Gemini attempts + USDA can take up to ~65s
            });

            if (response.data.data && Array.isArray(response.data.data)) {
                showResults(response.data.data, response.data.totalPages, response.data.searchTerm);
                setNotice(`We think this is "${response.data.searchTerm}". Not right? Search by name or scan the barcode.`);
            }
        } catch (err) {
            setError(errorMessage(err, 'Failed to analyze image. Please try again.'));
        } finally {
            setIsLoading(false);
            // Reset the input value to allow selecting the same file again
            input.value = '';
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchText.trim()) return;

        try {
            setIsLoading(true);
            setError(null);
            setNotice(null);
            const response = await axios.get(`${BASE_URL}/analyze-many-food/`, {
                params: { name: searchText.trim() }
            });
            showResults(response.data.data, response.data.totalPages);
        } catch (err) {
            setError(errorMessage(err, 'Failed to find food with that name. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/analyze-many-food/`, {
                params: { name: searchText.trim(), page }
            });
            showResults(response.data.data, response.data.totalPages, undefined, page);
        } catch (err) {
            setError(errorMessage(err, 'Failed to load page. Please try again.'));
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
            setNotice(null);
            const response = await axios.get(`${BASE_URL}/analyze-food/`, { params: { fcID: id } });
            showResults([response.data as FoodData], 1);
        } catch (err) {
            setError(errorMessage(err, 'Failed to find food with that ID. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetSearch = () => {
        setSearchState(EMPTY_SEARCH_STATE);
        setID(null);
        setError(null);
        setNotice(null);
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
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
        if (loadingDelay < 15) return "Still preheating the servers... hang tight! 🔥";
        if (loadingDelay < 25) return "Slow-roasting the nutrition facts... almost ready! 🥘";
        return "Server is heating up... 🍳";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            {showScanner && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
                    </div>
                }>
                    <BarcodeScanner onDetected={lookupBarcode} onClose={() => setShowScanner(false)} />
                </Suspense>
            )}

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

                {notice && (
                    <div className="bg-yellow-50 border-l-4 flex border-yellow-400 p-4 mb-6 rounded-md">
                        <p className="text-yellow-800">{notice}</p>
                        <div className='ml-auto'><X size={24} className='text-yellow-800 cursor-pointer' onClick={() => setNotice(null)} /></div>
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
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 ml-2">
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
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <FoodList
                                foodItems={manyFoodData}
                                pages={pages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                ) : (
                    <div>
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center py-12">
                                <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
                                <p className="text-sm text-gray-600 mt-2">{getLoadingMessage()}</p>
                            </div>
                        ) : (
                            <div>
                                {/* Scan options */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Barcode Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Scan Barcode</h3>
                                        <button
                                            onClick={() => setShowScanner(true)}
                                            type="button"
                                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-8
                                                border-2 border-dashed border-green-300 flex flex-col items-center"
                                        >
                                            <Barcode size={48} className="text-green-600 mb-4" />
                                            <span className="text-gray-600">Best for packaged food</span>
                                        </button>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Upload Food Image</h3>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            type="button"
                                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-8
                                                border-2 border-dashed border-green-300 flex flex-col items-center"
                                        >
                                            <Upload size={48} className="text-green-600 mb-4" />
                                            <span className="text-gray-600">Click to upload image</span>
                                        </button>
                                    </div>

                                    {/* Camera Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Use Camera</h3>
                                        <button
                                            onClick={() => cameraInputRef.current?.click()}
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
                                    <h3 className="text-xl font-semibold mb-4">How to Use ScanMyFood</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                                <span className="text-xl font-bold text-green-600">1</span>
                                            </div>
                                            <h4 className="font-medium mb-1">Search or Scan</h4>
                                            <p className="text-gray-600 text-sm">Search by name, scan a barcode, or take a picture of your food</p>
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

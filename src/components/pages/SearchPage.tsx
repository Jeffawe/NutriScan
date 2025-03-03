import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Search, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { FoodData } from '../types';
import FoodList from './FoodList';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
    const [searchText, setSearchText] = useState('');
    const [id, setID] = useState<number | null>(null);
    const [manyFoodData, setManyFoodData] = useState<FoodData[] | null>(null);
    const [isSearchById, setIsSearchById] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const navigate = useNavigate();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const formData = new FormData();
            formData.append('image', file);
            const response = await axios.post(`${BASE_URL}/analyze-image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log(response.data);
            if (response.data && Array.isArray(response.data)) {
                setManyFoodData(response.data);
            }
        } catch (error) {
            console.error(error);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchText.trim()) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/analyze-many-food/?name=${searchText}`);
            setManyFoodData(response.data);
        } catch (error) {
            console.error(error);
            setError('Failed to find food with that name. Please try again.');
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
            console.error(error);
            setError('Failed to find food with that ID. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError('Unable to access camera. Please check permissions and try again.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraActive(false);
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                // Create a file from the blob
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                
                // Upload the file
                const formData = new FormData();
                formData.append('image', file);
                
                const response = await axios.post(`${BASE_URL}/analyze-image/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log(response.data);
                if (response.data && Array.isArray(response.data)) {
                    setManyFoodData(response.data);
                }
                
                // Stop the camera after successful capture
                stopCamera();
            } catch (error) {
                console.error(error);
                setError('Failed to analyze image. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }, "image/jpeg", 0.9);
    };

    const resetSearch = () => {
        setManyFoodData(null);
        setSearchText('');
        setID(null);
        setError(null);
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
                    {isCameraActive ? "Take a Picture" : "Analyze Your Food"}
                </h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {isCameraActive ? (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <div className="relative">
                            <video 
                                ref={videoRef}
                                autoPlay 
                                playsInline
                                className="w-full rounded-lg border border-gray-300"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-4">
                                <button
                                    onClick={captureImage}
                                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg"
                                    disabled={isLoading}
                                >
                                    <Camera size={24} />
                                </button>
                                <button
                                    onClick={stopCamera}
                                    className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search Form */}
                        {!manyFoodData && (
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
                                    <input
                                        type="checkbox"
                                        id="searchById"
                                        checked={isSearchById}
                                        onChange={() => setIsSearchById(!isSearchById)}
                                        className="h-5 w-5 cursor-pointer accent-green-600"
                                    />
                                    <label htmlFor="searchById" className="text-gray-700 cursor-pointer">
                                        Search by FDCID
                                    </label>
                                </div>
                            </form>
                        )}

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
                                <FoodList foodItems={manyFoodData} />
                            </div>
                        ) : (
                            <div>
                                {/* Upload and Scan Options */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Upload Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Upload Food Image</h3>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                                                border-2 border-dashed border-green-300 flex flex-col items-center"
                                            >
                                                <Upload size={48} className="text-green-600 mb-4" />
                                                <span className="text-gray-600">Click to upload image</span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    disabled={isLoading}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Scan Section */}
                                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                        <h3 className="font-semibold text-lg mb-4">Use Camera</h3>
                                        <button
                                            onClick={startCamera}
                                            disabled={isLoading}
                                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                                            border-2 border-dashed border-green-300 flex flex-col items-center"
                                        >
                                            <Camera size={48} className="text-green-600 mb-4" />
                                            <span className="text-gray-600">
                                                {isMobile ? "Take a picture" : "Access camera"}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
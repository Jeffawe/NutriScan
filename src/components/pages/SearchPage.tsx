import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import axios from 'axios';
import { FoodData } from '../types';
import FoodList from './FoodList';

const BASE_URL = import.meta.env.VITE_BASE_URL

const SearchPage = () => {
    const [searchText, setSearchText] = useState('');
    const [id, setID] = useState<number | null>(null)
    const [manyFoodData, setManyFoodData] = useState<FoodData[] | null>(null)
    const [isSearchById, setIsSearchById] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        try {
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const response = await axios.post(`${BASE_URL}/analyze-image/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                console.log(response.data)
            }
        } catch (error) {
            console.error(error)
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${BASE_URL}/analyze-many-food/?name=${searchText}`)
            console.log('Searching for:', searchText);
            console.log(response.data)
            setManyFoodData(response.data)
            console.log(manyFoodData)
        } catch (error) {
            console.error(error)
        }
    };

    const handleSingleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSearchById) return
        try {
            const response = await axios.get(`${BASE_URL}/analyze-food/?fcID=${searchText}`)
            const result = [response.data as FoodData];
            setManyFoodData(result)
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Analyze Your Product
                </h2>

                {/* Search Form */}
                <form onSubmit={isSearchById ? handleSingleSearch : handleSearch} className="mb-8">
                    <div className="flex gap-2 items-center">
                        <input
                            type={isSearchById ? "number" : "text"}
                            value={isSearchById ? id ?? "" : searchText}
                            onChange={(e) =>
                                isSearchById ? setID(Number(e.target.value)) : setSearchText(e.target.value)
                            }
                            placeholder={isSearchById ? "Enter product FDCID..." : "Enter product name..."}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="searchById"
                                checked={isSearchById}
                                onChange={() => setIsSearchById(!isSearchById)}
                                className="h-5 w-5 cursor-pointer"
                            />
                            <label htmlFor="searchById" className="text-gray-700 cursor-pointer">
                                Search by FDCID
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                         rounded-lg font-semibold"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {manyFoodData ?
                    <div>
                        <FoodList foodItems={manyFoodData} />
                    </div>
                    :
                    <div>
                        {/* Upload and Scan Options */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Upload Section */}
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <div className="mb-4">
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                           border-2 border-dashed border-gray-300 flex flex-col items-center"
                                    >
                                        <img
                                            src="/api/placeholder/64/64"
                                            alt="Upload"
                                            className="mb-4"
                                        />
                                        <span className="text-gray-600">Click to upload image</span>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Scan Section */}
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <button
                                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-8 
                         border-2 border-dashed border-gray-300 flex flex-col items-center"
                                >
                                    <Camera size={48} className="text-gray-600 mb-4" />
                                    <span className="text-gray-600">Scan with camera</span>
                                </button>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    );
};

export default SearchPage;
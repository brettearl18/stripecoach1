'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FoodItem } from '@/types/food';
import {
  CameraIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Mock data - Replace with actual API call
const mockFoodData: FoodItem = {
  id: '1',
  barcode: '123456789',
  name: 'Protein Bar',
  brand: 'Health Foods Co.',
  nutrition: {
    calories: 200,
    protein: 20,
    carbohydrates: 25,
    fat: 8,
    fiber: 3,
    sugar: 2,
    servingSize: '1 bar',
    servingSizeGrams: 60,
  },
  ingredients: [
    'Whey Protein Isolate',
    'Almonds',
    'Honey',
    'Dark Chocolate',
  ],
  allergens: ['Milk', 'Tree Nuts'],
  image: 'https://placehold.co/400x300',
  verified: true,
  lastUpdated: '2024-03-27',
};

export default function FoodScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleScan = async (barcode: string) => {
    // TODO: Replace with actual API call
    setScannedFood(mockFoodData);
    setIsScanning(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleAddToLog = () => {
    // TODO: Implement food logging
    console.log('Adding to food log:', scannedFood?.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Food Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan barcodes or search for foods to track your nutrition
          </p>
        </div>

        <div className="grid gap-6">
          {/* Search and Scan Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>

            <button
              onClick={() => setIsScanning(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <CameraIcon className="h-5 w-5" />
              Scan Barcode
            </button>
          </div>

          {/* Scanned Food Result */}
          {scannedFood && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {scannedFood.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{scannedFood.brand}</p>
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    {isFavorite ? (
                      <StarIconSolid className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <StarIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>

              {scannedFood.image && (
                <div className="aspect-[4/3] relative">
                  <img
                    src={scannedFood.image}
                    alt={scannedFood.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Serving Size</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {scannedFood.nutrition.servingSize} ({scannedFood.nutrition.servingSizeGrams}g)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {scannedFood.nutrition.calories} kcal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Nutrition</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Protein</span>
                        <span className="text-gray-900 dark:text-white">{scannedFood.nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                        <span className="text-gray-900 dark:text-white">{scannedFood.nutrition.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fat</span>
                        <span className="text-gray-900 dark:text-white">{scannedFood.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fiber</span>
                        <span className="text-gray-900 dark:text-white">{scannedFood.nutrition.fiber}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sugar</span>
                        <span className="text-gray-900 dark:text-white">{scannedFood.nutrition.sugar}g</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Allergens</h3>
                    <div className="flex flex-wrap gap-2">
                      {scannedFood.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-full"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Ingredients</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {scannedFood.ingredients.join(', ')}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleAddToLog}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add to Food Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isScanning && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
} 
import React, { useState } from 'react';

// Helper components for icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const HotelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4V3a1 1 0 011-1zm0 2H5v10h10V5h-5v2a1 1 0 01-2 0V4z" clipRule="evenodd" />
    </svg>
);

const FlightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11.5a1 1 0 012 0v5.071a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const TourIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


// Mock data for bundle deals
const mockBundles = [
  {
    id: 1,
    hotel: {
      name: 'The Grand Hotel, Taipei',
      price: 250,
      rating: 5,
      image: 'https://placehold.co/600x400/a2a8d3/ffffff?text=Grand+Hotel',
      description: 'Experience luxury in the heart of Taipei, with stunning views and world-class amenities.'
    },
    flight: {
      airline: 'Singapore Airlines',
      price: 450,
      details: 'Direct flight from Singapore to Taipei. Includes 25kg baggage allowance.'
    },
    tour: {
      name: 'Yangmingshan National Park Hiking Tour',
      price: 80,
      details: 'A full-day guided hike through the beautiful volcanic landscapes of Yangmingshan.'
    }
  },
  {
    id: 2,
    hotel: {
      name: 'W Taipei',
      price: 320,
      rating: 4,
      image: 'https://placehold.co/600x400/e7eaf6/343a40?text=W+Taipei',
      description: 'A stylish and modern hotel located in the vibrant Xinyi district.'
    },
    flight: null,
    tour: {
      name: 'Taroko Gorge Discovery',
      price: 120,
      details: 'Explore the marble cliffs and breathtaking scenery of Taroko National Park.'
    }
  },
    {
    id: 3,
    hotel: {
      name: 'Hotel Eclat Taipei',
      price: 180,
      rating: 4,
      image: 'https://placehold.co/600x400/a7d8de/ffffff?text=Hotel+Eclat',
      description: 'A boutique hotel known for its unique art collection and luxurious comfort.'
    },
    flight: {
      airline: 'EVA Air',
      price: 400,
      details: 'Return flights from Singapore to Taipei with comfortable seating.'
    },
    tour: null
  }
];

const BundleDealAI = () => {
  const [prompt, setPrompt] = useState('');
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBundles(mockBundles);
      setIsLoading(false);
    }, 2000);
  };

  const calculateTotalPrice = (bundle) => {
      let total = bundle.hotel.price;
      if (bundle.flight) total += bundle.flight.price;
      if (bundle.tour) total += bundle.tour.price;
      return total;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Prompt Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Craft Your Perfect Trip with AI</h1>
          <p className="text-gray-500 mb-6">Just tell us what you're dreaming of, and we'll bundle the perfect trip for you.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., "I am planning to travel to Taiwan around end of December to hike."'
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition duration-150 ease-in-out"
            >
              {isLoading ? 'Generating...' : 'Generate Bundles'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && bundles.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Your AI-Curated Bundles</h2>
            {bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img className="h-48 w-full object-cover md:h-full md:w-64" src={bundle.hotel.image} alt={bundle.hotel.name} />
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center mb-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < bundle.hotel.rating} />)}
                                </div>
                                <span className="ml-2 text-sm text-gray-500">{bundle.hotel.rating}.0 Rating</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{bundle.hotel.name}</h3>
                            <p className="text-gray-600 mt-1">{bundle.hotel.description}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-sm text-gray-500">Bundle price from</p>
                            <p className="text-2xl font-bold text-blue-600">${calculateTotalPrice(bundle)}</p>
                            <p className="text-sm text-gray-500">per person</p>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">What's included:</h4>
                        <div className="space-y-4">
                            {/* Hotel */}
                            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                <HotelIcon />
                                <div>
                                    <p className="font-semibold text-gray-800">Hotel Stay</p>
                                    <p className="text-sm text-gray-600">{bundle.hotel.name}</p>
                                </div>
                                <p className="ml-auto text-sm font-medium text-gray-700">${bundle.hotel.price}</p>
                            </div>

                            {/* Flight */}
                            {bundle.flight ? (
                                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                    <FlightIcon />
                                    <div>
                                        <p className="font-semibold text-gray-800">Round-trip Flights</p>
                                        <p className="text-sm text-gray-600">{bundle.flight.details}</p>
                                    </div>
                                    <p className="ml-auto text-sm font-medium text-gray-700">${bundle.flight.price}</p>
                                </div>
                            ) : (
                                <div className="flex items-start p-3 bg-gray-100 rounded-lg opacity-60">
                                    <FlightIcon />
                                    <div>
                                        <p className="font-semibold text-gray-500">No Flight Included</p>
                                        <p className="text-sm text-gray-500">You can add flights separately.</p>
                                    </div>
                                </div>
                            )}

                             {/* Tour */}
                            {bundle.tour ? (
                                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                    <TourIcon />
                                    <div>
                                        <p className="font-semibold text-gray-800">Local Tour</p>
                                        <p className="text-sm text-gray-600">{bundle.tour.name}</p>
                                    </div>
                                    <p className="ml-auto text-sm font-medium text-gray-700">${bundle.tour.price}</p>
                                </div>
                            ) : (
                                <div className="flex items-start p-3 bg-gray-100 rounded-lg opacity-60">
                                    <TourIcon />
                                    <div>
                                        <p className="font-semibold text-gray-500">No Tour Included</p>
                                        <p className="text-sm text-gray-500">Explore on your own or add a tour later.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="mt-6 text-right">
                        <button className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition duration-150 ease-in-out">
                            View Details & Book
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && bundles.length === 0 && (
             <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-700">Let's find your next adventure!</h2>
                <p className="text-gray-500 mt-2">Enter a description of your ideal trip above to get started.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default BundleDealAI;

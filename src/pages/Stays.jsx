import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

const Stays = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (searchQuery, results) => {
    console.log('Searching stays for:', searchQuery);
    console.log('Results received:', results);
    setSearchResults(results || []);
    setHasSearched(true);
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-10">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0e151b] mb-4">Find Your Perfect Stay</h1>
          <p className="text-lg text-[#4e7997] mb-6">
            Discover amazing places to stay around the world
          </p>
          <SearchBar 
            placeholder="Search destinations, hotels, or attractions..."
            onSearch={handleSearch}
            size="large"
          />
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[#0e151b] mb-6">
            {hasSearched ? (searchResults.length > 0 ? 'Search Results' : 'No Results Found') : 'Popular Destinations'}
          </h2>
          
          {hasSearched && searchResults.length === 0 ? (
            // No results found message
            <div className="text-center py-12">
              <p className="text-[#4e7997] text-lg mb-4">
                No hotels found for your search. Try different keywords or browse our popular destinations below.
              </p>
              <button 
                onClick={() => {setHasSearched(false); setSearchResults([]);}}
                className="text-[#47a6ea] hover:underline font-medium"
              >
                Browse Popular Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.length > 0 ? (
                // Display search results
                searchResults.map((hotel, index) => (
                  <div key={hotel.id || index} className="bg-white rounded-lg shadow-sm border border-[#e7eef3] overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#0e151b] mb-2">
                        {hotel.name || 'Hotel Name'}
                      </h3>
                      <p className="text-[#4e7997] text-sm">
                        {hotel.location || 'Location'}
                      </p>
                      <p className="text-[#4e7997] text-sm">
                        From ${hotel.price || '120'}/night
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Display default popular destinations
                <>
                  <div className="bg-white rounded-lg shadow-sm border border-[#e7eef3] overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#0e151b] mb-2">Paris, France</h3>
                      <p className="text-[#4e7997] text-sm">From $120/night</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-[#e7eef3] overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#0e151b] mb-2">Tokyo, Japan</h3>
                      <p className="text-[#4e7997] text-sm">From $85/night</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-[#e7eef3] overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#0e151b] mb-2">New York, USA</h3>
                      <p className="text-[#4e7997] text-sm">From $150/night</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stays;

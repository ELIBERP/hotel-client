import React from 'react';
import SearchBar from './SearchBar'; // this is your teammate's real component

export const SearchBarHotelDetails = () => {
  return (
    <section className="w-full border-b border-gray-200 bg-white">
      <div className="w-full px-6 sm:px-16 py-4 bg-[#f2f2f4] rounded-xl shadow-sm">
        
        <SearchBar
          placeholder="Paris, France"
          size="large"  
          className="w-full max-w-screen-xl mx-auto"
          onSearch={(query, results) => {
            console.log("Hotel details search triggered:", query, results);
            // Optional: hook into router, state, or show results
          }}
        />
      </div>
    </section>
  );
};
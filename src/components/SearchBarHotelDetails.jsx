import React from 'react';
import SearchBar from './SearchBar'; // this is your teammate's real component

export const SearchBarHotelDetails = () => {
  return (
    <section className="w-full border-b border-gray-200 bg-white">
      <div className="w-full px-6 sm:px-16 py-4 bg-[#f2f2f4] rounded-xl shadow-sm">
        {/* This reuses the real search bar inside the styled Anima-like container */}
        <SearchBar
          placeholder="Paris, France"
          size="large"  
          className="w-full"
          maxWidth="max-w-full"
          onSearch={(query, results) => {
            console.log("Hotel details search triggered:", query, results);
            // Optional: hook into router, state, or show results
          }}
        />
      </div>
    </section>
  );
};
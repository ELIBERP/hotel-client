import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import destinationsData from '../assets/destinations.json';

const SearchBar = ({ 
  placeholder = "Where are you going?", 
  onSearch, 
  className = "",
  size = "default" // "default" or "large"
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimerRef = useRef(null);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    console.log("Search input:", newValue); // debugging purpose

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer that will execute 300ms after the user stops typing
    debounceTimerRef.current = setTimeout(() => {
      console.log("Debounced search input:", newValue); // debugging purpose
      
      // Show dropdown when typing
      if (newValue.length > 0) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
      
      // Here you could also make an API call for suggestions
      // if you want to fetch search suggestions as the user types
    }, 700); // Adjust debounce (delay) time as needed 
  };

  // Clean up the timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setIsLoading(true);
    try {
      // Make GET request to /hotels endpoint with search query
      const results = await ApiService.getHotels({
        destination_id: searchId.trim()
      });
      console.log('Hotels search results:', results);
      
      // Call the parent component's onSearch function
      if (onSearch) {
        onSearch(searchId, results);
      }
    } catch (error) {
      console.error('Hotels search failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // temp dropdown items (replace this with real data later)
  // using ../assets/destinations.json
  const sampleDestinations = [
    "WD0M",
    "Singapore",
    "Bangkok",
    "Tokyo",
    "Paris",
    "London"
  ];

  const filteredDestinations = destinationsData
  .filter(dest =>
    dest.term && dest.term.toLowerCase().includes(searchValue.toLowerCase())
  )
  .slice(0, 8); // Limit to 8 suggestions for better UX

  const handleDropdownClick = (term, uid) => {
    setSearchValue(term);
    setSearchId(uid);
    setShowDropdown(false);
  };

  // Size variants
  const sizeClasses = {
    default: {
      container: "h-12",
      input: "text-sm",
      button: "h-8 px-3 text-sm"
    },
    large: {
      container: "h-14 @[480px]:h-16",
      input: "text-sm @[480px]:text-base",
      button: "h-10 px-4 @[480px]:h-12 @[480px]:px-5 text-sm @[480px]:text-base"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="relative w-full max-w-[480px]">
      <label className={`flex flex-col min-w-40 ${currentSize.container} w-full max-w-[480px] ${className}`}>
        <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
          <div
            className="text-[#4e7997] flex border border-[#d0dde7] bg-slate-50 items-center justify-center pl-[15px] rounded-l-xl border-r-0"
            data-icon="MagnifyingGlass"
            data-size="20px"
            data-weight="regular"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
              ></path>
            </svg>
          </div>
          <input
            placeholder={placeholder}
            className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl
            text-[#0e151b] focus:outline-0 focus:ring-0 border border-[#d0dde7] bg-slate-50 focus:border-[#d0dde7] 
            h-full placeholder:text-[#4e7997] px-[15px] rounded-r-none border-r-0 pr-2 rounded-l-none border-l-0 pl-2 
            font-normal leading-normal ${currentSize.input}`}
            value={searchValue}
            onChange={handleInputChange}
            onKeyUp={handleKeyPress}
            onKeyDown={handleKeyPress}
          />
          <div className="flex items-center justify-center rounded-r-xl border-l-0 border border-[#d0dde7] bg-slate-50 pr-[7px]">
            <button
              className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl 
              bg-[#47a6ea] text-[#0e151b] font-bold leading-normal tracking-[0.015em] ${currentSize.button} 
              ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={handleSearch}
              disabled={isLoading}
            >
              <span className="truncate">
                {isLoading ? 'Searching...' : 'Search'}
              </span>
            </button>
          </div>
        </div>
      </label>

      {/* Simple Dropdown */}
      {showDropdown && filteredDestinations.length > 0 && (
        //set box below search bar
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredDestinations.map((destination, index) => ( //list items
            <div
              key={index}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleDropdownClick(destination.term, destination.uid)}
            >
              {destination.term}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

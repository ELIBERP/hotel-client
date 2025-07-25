import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import destinationsData from '../assets/destinations.json';

const SearchBar_Landing = ({ 
  placeholder = "Where are you going?", 
  onSearch, 
  className = ""
}) => {
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Destination autocomplete states
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle destination input change with debouncing
  const handleDestinationInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      if (newValue.length >= 2) {
        console.log('Searching destinations for:', newValue); // Debug log
        const filtered = destinationsData
          .filter(destination => 
            destination && 
            destination.term && 
            typeof destination.term === 'string' &&
            destination.term.toLowerCase().includes(newValue.toLowerCase())
          )
          .slice(0, 10); // Limit to 10 results
        
        console.log('Found destinations (FROM destinations.json):', filtered.length); // Debug log
        setFilteredDestinations(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredDestinations([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce
  };

  // Handle dropdown item selection
  const handleDropdownClick = (destinationName, destinationId) => {
    setSearchValue(destinationName);
    setSearchId(destinationId);
    setShowDropdown(false);
    setFilteredDestinations([]);
    
    // Clear destination error if exists
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: '' }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};
    
    // Destination validation
    if (!searchId.trim()) {
      newErrors.destination = "Please select a destination";
    }
    
    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!checkinDate) {
      newErrors.checkin = "Check-in date is required";
    } else {
      const checkin = new Date(checkinDate);
      if (checkin < today) {
        newErrors.checkin = "Check-in date must be in the future";
      }
    }
    
    if (!checkoutDate) {
      newErrors.checkout = "Check-out date is required";
    } else if (checkinDate) {
      const checkin = new Date(checkinDate);
      const checkout = new Date(checkoutDate);
      if (checkout <= checkin) {
        newErrors.checkout = "Check-out date must be after check-in date";
      }
    }
    
    // Guest validation
    if (guests < 1 || guests > 10) {
      newErrors.guests = "Guests must be between 1 and 10";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Prepare search parameters
      const searchParams = {
        destination_id: searchId.trim(),
        checkin: formatDateForAPI(checkinDate),
        checkout: formatDateForAPI(checkoutDate),
        guests: guests
      };
      
      console.log('Search parameters:', searchParams);
      
      // Make GET request to /hotels endpoint with search query
      const results = await ApiService.getHotels(searchParams);
      console.log('Hotels search results:', results);
      
      // Call the parent component's onSearch function
      if (onSearch) {
        onSearch(searchId, results, searchParams);
      }
    } catch (error) {
      console.error('Hotels search failed:', error);
      setErrors({ general: 'Search failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get minimum checkout date (1 day after checkin)
  const getMinCheckoutDate = () => {
    if (!checkinDate) return getTodayDate();
    const checkin = new Date(checkinDate);
    checkin.setDate(checkin.getDate() + 1);
    return checkin.toISOString().split('T')[0];
  };

  return (
    <div className="w-full max-w-[480px]">
      {/* Error Messages */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Destination Search Bar with Autocomplete */}
      <div className="mb-4" ref={dropdownRef}>
        <div className="relative">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-14 @[480px]:h-16">
            <div className="text-[#4e7997] flex border border-[#d0dde7] bg-slate-50 items-center justify-center pl-[15px] rounded-l-lg border-r-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              placeholder={placeholder}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
              text-[#0e151b] focus:outline-0 focus:ring-0 border border-[#d0dde7] bg-slate-50 focus:border-[#47a6ea] 
              h-full placeholder:text-[#4e7997] px-[15px] rounded-r-lg border-r-0 pr-2 rounded-l-none border-l-0 pl-2 
              font-normal leading-normal text-sm @[480px]:text-base
              ${errors.destination ? 'border-red-400 focus:border-red-400' : ''}`}
              value={searchValue}
              onChange={handleDestinationInputChange}
              onFocus={() => {
                if (filteredDestinations.length > 0) {
                  setShowDropdown(true);
                }
              }}
            />
          </div>
          
          {/* Autocomplete Dropdown */}
          {showDropdown && filteredDestinations.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
              {filteredDestinations.map((destination, index) => (
                <div
                  key={destination.uid || index}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm transition-colors"
                  onClick={() => handleDropdownClick(destination.term, destination.uid)}
                >
                  <div className="font-medium text-[#0e151b]">{destination.term}</div>
                  {destination.region && (
                    <div className="text-xs text-[#4e7997] mt-1">{destination.region}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Show "No results found" if typing but no matches */}
          {showDropdown && filteredDestinations.length === 0 && searchValue.length >= 2 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 mt-1">
              <div className="p-3 text-sm text-gray-500 text-center">
                No destinations found for "{searchValue}"
              </div>
            </div>
          )}
        </div>
        {errors.destination && (
          <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
        )}
      </div>

      {/* Check-in and Check-out dates - side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Check-in
          </label>
          <div className="relative">
            <div className="absolute left-3 inset-y-0 flex items-center justify-center text-[#4e7997]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
              </svg>
            </div>
            <input
              type="date"
              className={`w-full pl-10 pr-3 py-3 border border-[#d0dde7] rounded-lg bg-slate-50 text-[#0e151b] text-sm @[480px]:text-base
                focus:outline-none focus:ring-2 focus:ring-[#47a6ea] focus:border-transparent
                ${errors.checkin ? 'border-red-400' : ''}`}
              value={checkinDate}
              min={getTodayDate()}
              onChange={(e) => {
                setCheckinDate(e.target.value);
                // Clear checkout if it's before new checkin
                if (checkoutDate && new Date(e.target.value) >= new Date(checkoutDate)) {
                  setCheckoutDate("");
                }
                // Clear errors
                if (errors.checkin) {
                  setErrors(prev => ({ ...prev, checkin: '' }));
                }
              }}
            />
          </div>
          {errors.checkin && (
            <p className="mt-1 text-sm text-red-600">{errors.checkin}</p>
          )}
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Check-out
          </label>
          <div className="relative">
            <div className="absolute left-3 inset-y-0 flex items-center justify-center text-[#4e7997]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
              </svg>
            </div>
            <input
              type="date"
              className={`w-full pl-10 pr-3 py-3 border border-[#d0dde7] rounded-lg bg-slate-50 text-[#0e151b] text-sm @[480px]:text-base
                focus:outline-none focus:ring-2 focus:ring-[#47a6ea] focus:border-transparent
                ${errors.checkout ? 'border-red-400' : ''}`}
              value={checkoutDate}
              min={getMinCheckoutDate()}
              onChange={(e) => {
                setCheckoutDate(e.target.value);
                if (errors.checkout) {
                  setErrors(prev => ({ ...prev, checkout: '' }));
                }
              }}
            />
          </div>
          {errors.checkout && (
            <p className="mt-1 text-sm text-red-600">{errors.checkout}</p>
          )}
        </div>
      </div>

      {/* Number of Guests - full width below */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#0e151b] mb-1">
          Guests
        </label>
        <div className="relative">
          <div className="absolute left-3 inset-y-0 flex items-center justify-center text-[#4e7997]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.27,98.63a8,8,0,0,1-11.07,2.22A79.75,79.75,0,0,0,208,196a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.27,206.63Z"></path>
            </svg>
          </div>
          <select
            className={`w-full pl-10 pr-3 py-3 border border-[#d0dde7] rounded-lg bg-slate-50 text-[#0e151b] text-sm @[480px]:text-base
              focus:outline-none focus:ring-2 focus:ring-[#47a6ea] focus:border-transparent
              ${errors.guests ? 'border-red-400' : ''}`}
            value={guests}
            onChange={(e) => {
              setGuests(parseInt(e.target.value));
              if (errors.guests) {
                setErrors(prev => ({ ...prev, guests: '' }));
              }
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
        {errors.guests && (
          <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
        )}
      </div>

      {/* Search Button */}
      <div className="flex justify-center">
        <button
          className={`flex items-center justify-center bg-[#47a6ea] hover:bg-[#3a95d9] text-white font-bold 
            rounded-lg transition-colors duration-200 w-full h-12 @[480px]:h-14 text-sm @[480px]:text-base
            ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Searching Hotels...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="mr-2">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
              Search Hotels
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchBar_Landing;

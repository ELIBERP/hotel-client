import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import destinationsData from '../assets/destinations.json';
import fuzzysort from 'fuzzysort';

const SearchBar_Landing = ({ 
  placeholder = "Where are you going?", 
  onSearch, 
  className = ""
}) => {
  // define variables
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [showGuestRoomDropdown, setShowGuestRoomDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lang] = useState("en_US");
  const [currency] = useState("SGD");
  const [partner_id] = useState("1089");
  const [landing_page] = useState("wl-acme-earn");
  const [product_type] = useState("earn");

  // Destination autocomplete states
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const guestRoomDropdownRef = useRef(null);

  // Handle destination input change with debouncing + autocorrect
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Reference to popular destinations for prioritizing matches
  const popularDestinations = useRef([
    "Singapore", "Tokyo", "London", "Paris", "New York", "Bangkok", "Bali", 
    "Rome", "Dubai", "Hong Kong", "Seoul", "Barcelona", "Amsterdam", "Sydney", 
    "Los Angeles", "Miami", "Istanbul", "Las Vegas", "Madrid", "Berlin"
  ]);

  const handleDestinationInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setIsSearching(true);
    
    // If the user is typing something different than what they selected, clear the searchId
    if (searchId && newValue !== searchValue) {
      setSearchId("");
    }
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      setIsSearching(false);
      setSuggestions([]); // Reset suggestions
      
      if (newValue.length >= 2) { // start auto complete search on 2nd input
        console.log('Searching destinations for:', newValue);
        
        // STEP 1: Look for exact matches first (partial matching)
        const filtered = destinationsData
          .filter(destination => 
            destination && 
            destination.term && 
            typeof destination.term === 'string' &&
            destination.term.toLowerCase().includes(newValue.toLowerCase())
          )
          .slice(0, 10); // limit to 10 results
          
        console.log('Found exact matches:', filtered.length);
        setFilteredDestinations(filtered);
        setShowDropdown(true); // Always show dropdown when searching
        
        // STEP 2: If no exact matches, or very few, add fuzzy matching suggestions
        if (filtered.length < 3) {
          console.log('Finding fuzzy matches for:', newValue);
          
          // Create an index of destinations for faster searching
          // Focus on top 25,000 destinations for better performance
          const validDestinations = destinationsData
            .filter(d => d && d.term && typeof d.term === 'string')
            .slice(0, 25000);
          
          // Prepare data for fuzzysort
          const preparedDestinations = validDestinations.map(dest => ({
            original: dest,
            prepared: fuzzysort.prepare(dest.term)
          }));
          
          // STEP 3: First try to match against popular destinations (higher priority)
          const popularMatches = [];
          
          for (const popularDest of popularDestinations.current) {
            // Find destinations containing this popular city
            const matchingDests = validDestinations.filter(d => 
              d.term.includes(popularDest)
            ).slice(0, 2); // Just take a couple for each popular city
            
            if (matchingDests.length > 0) {
              popularMatches.push(...matchingDests);
            }
          }
          
          // Prepare popular destinations for fuzzy search
          const preparedPopular = popularMatches.map(dest => ({
            original: dest,
            prepared: fuzzysort.prepare(dest.term)
          }));
          
          // STEP 4: Perform advanced fuzzy search with fuzzysort
          
          // Try popular destinations first (gives better results for common cities)
          const popularResults = fuzzysort.go(newValue, preparedPopular, {
            key: 'prepared',
            allowTypo: true,
            threshold: -10000, // More permissive threshold
            limit: 3
          });
          
          // Then try all destinations
          const fuzzyResults = fuzzysort.go(newValue, preparedDestinations, {
            key: 'prepared',
            allowTypo: true,
            threshold: -5000, // Less permissive for general results
            limit: 5
          });
          
          console.log('Popular fuzzy results:', popularResults.length);
          console.log('General fuzzy results:', fuzzyResults.length);
          
          // STEP 5: Process and deduplicate results
          const allResults = [...popularResults, ...fuzzyResults];
          const uniqueResults = [];
          const seenTerms = new Set();
          
          for (const result of allResults) {
            const destination = result.obj.original;
            if (!seenTerms.has(destination.term)) {
              seenTerms.add(destination.term);
              uniqueResults.push(destination);
              
              // Don't add too many
              if (uniqueResults.length >= 5) break;
            }
          }
          
          // Set suggestions for display
          if (uniqueResults.length > 0) {
            console.log('Found suggestions:', uniqueResults.map(d => d.term));
            setSuggestions(uniqueResults);
          }
        }
      } else {
        // Input is too short
        setFilteredDestinations([]);
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  // Handle dropdown item selection
  const handleDropdownClick = (destinationName, destinationId) => {
    setSearchValue(destinationName);
    setSearchId(destinationId);
    setShowDropdown(false);
    setFilteredDestinations([]);
    setSuggestions([]);
    
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
      if (guestRoomDropdownRef.current && !guestRoomDropdownRef.current.contains(event.target)) {
        setShowGuestRoomDropdown(false);
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
      
      // Calculate the difference in days
      const diffTime = checkout.getTime() - checkin.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (checkout <= checkin) {
        newErrors.checkout = "Check-out date must be after check-in date";
      } else if (diffDays < 3) {
        newErrors.checkout = "Check-out date must be at least 3 days after check-in date";
      }
    }
    
    // Guest validation
    const totalGuests = adults + children;
    if (totalGuests < 1 || totalGuests > 10) {
      newErrors.guests = "Total guests must be between 1 and 10";
    }
    
    // Room validation
    if (rooms < 1 || rooms > 5) {
      newErrors.rooms = "Rooms must be between 1 and 5";
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
    
    // Calculate guests value based on number of rooms before we call API
    let guests;
    if (rooms === 1) {
      guests = adults + children;
    } else {
      // For multiple rooms, each room gets the total number of guests
      const totalGuests = adults + children;
      guests = Array(rooms).fill(totalGuests).join('|');
    }
    
    try {
      // search parameters
      const searchParams = {
        destination_id: searchId.trim(),
        checkin: formatDateForAPI(checkinDate),
        checkout: formatDateForAPI(checkoutDate),
        lang: lang,
        currency: currency,
        guests: guests,
        partner_id: partner_id,
        landing_page: landing_page,
        product_type: product_type
      };
      
      console.log('Search parameters:', searchParams);
      
      // COMMENTED OUT (API CALL)
      // Make GET request to /hotels endpoint with search query
      // const results = await ApiService.getHotels(searchParams);
      console.log('Using static hotel results instead of API');
      const results = { hotels: [{ id: 'mock-1', name: 'Mock Hotel 1' }, { id: 'mock-2', name: 'Mock Hotel 2' }] }; 
      console.log('Hotels search results:', results);
      
      // Call the parent component's onSearch function with results
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

  // Helper function to get minimum checkout date (3 days after checkin)
  const getMinCheckoutDate = () => {
    if (!checkinDate) return getTodayDate();
    const checkin = new Date(checkinDate);
    checkin.setDate(checkin.getDate() + 3); // Changed from +1 to +3 for minimum 3-day stay
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
                  key={`${destination.uid}-${index}`}
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
          
          {/* Show "No results found" if typing but no matches and no suggestion was selected */}
          {searchValue.length >= 2 && filteredDestinations.length === 0 && !searchId && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 mt-1">
              <div className="p-3 text-sm text-gray-500">
                {isSearching ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-2">No destinations found for "{searchValue}"</div>
                    {suggestions.length > 0 && (
                      <div className='mt-3'>
                        <div className="font-medium text-[#0e151b] text-base border-b pb-2 mb-1">Did you mean:</div>
                        {suggestions.map((suggestion, index) => (
                          <div 
                            key={`suggestion-${index}`}
                            className="cursor-pointer hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => handleDropdownClick(suggestion.term, suggestion.uid)}
                          >
                            <div className="p-3 border-b border-gray-100 flex items-center">
                              <div className="mr-2 text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-[#0e151b]">{suggestion.term}</div>
                                {suggestion.region && (
                                  <div className="text-xs text-[#4e7997]">{suggestion.region}</div>
                                )}
                              </div>
                              <div className="ml-2 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
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
                
                // Clear checkout if it doesn't meet the 3-day minimum stay requirement
                if (checkoutDate) {
                  const newCheckin = new Date(e.target.value);
                  const checkout = new Date(checkoutDate);
                  const diffTime = checkout.getTime() - newCheckin.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  // Clear if checkout is before checkin or less than 3 days after
                  if (newCheckin >= checkout || diffDays < 3) {
                    setCheckoutDate("");
                  }
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

      {/* Number of Guests and Rooms - full width below */}
      <div className="mb-6" ref={guestRoomDropdownRef}>
        <label className="block text-sm font-medium text-white mb-1">
          Guests & Rooms
        </label>
        <div className="relative">
          <div className="absolute left-3 inset-y-0 flex items-center justify-center text-[#4e7997]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.27,98.63a8,8,0,0,1-11.07,2.22A79.75,79.75,0,0,0,208,196a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.27,206.63Z"></path>
            </svg>
          </div>
          <button
            type="button"
            className={`w-full pl-10 pr-3 py-3 border border-[#d0dde7] rounded-lg bg-slate-50 text-[#0e151b] text-sm @[480px]:text-base
              focus:outline-none focus:ring-2 focus:ring-[#47a6ea] focus:border-transparent text-left
              ${errors.guests || errors.rooms ? 'border-red-400' : ''}`}
            onClick={() => setShowGuestRoomDropdown(!showGuestRoomDropdown)}
          >
            {adults + children} {adults + children === 1 ? 'Guest' : 'Guests'}, {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
          </button>
          
          {/* Guests & Rooms Dropdown */}
          {showGuestRoomDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 mt-1 p-4">
              {/* Adults */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-[#0e151b] text-sm">Adults</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <span className="text-lg leading-none">−</span>
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">{adults}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    disabled={adults >= 10}
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
              
              {/* Children */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-[#0e151b] text-sm">Children</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <span className="text-lg leading-none">−</span>
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">{children}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setChildren(Math.min(10, children + 1))}
                    disabled={children >= 10}
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
              
              {/* Rooms */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-[#0e151b] text-sm">Rooms</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                  >
                    <span className="text-lg leading-none">−</span>
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">{rooms}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setRooms(Math.min(5, rooms + 1))}
                    disabled={rooms >= 5}
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
              
              {/* Apply and Reset buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  className={`text-sm ${adults === 2 && children === 0 && rooms === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#47a6ea] hover:text-[#3a95d9] cursor-pointer'}`}
                  disabled={adults === 2 && children === 0 && rooms === 1}
                  onClick={() => {
                    if (!(adults === 2 && children === 0 && rooms === 1)) {
                      setAdults(2);
                      setChildren(0);
                      setRooms(1);
                    }
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="bg-[#47a6ea] hover:bg-[#3a95d9] text-white px-4 py-2 rounded-lg text-sm font-medium"
                  onClick={() => {
                    setShowGuestRoomDropdown(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        {(errors.guests || errors.rooms) && (
          <p className="mt-1 text-sm text-red-600">{errors.guests || errors.rooms}</p>
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

import React, { useState } from 'react';

const SearchBar = ({ 
  placeholder = "Where are you going?", 
  onSearch, 
  className = "",
  size = "default" // "default" or "large"
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e) => {
    // on input change, update the search value
    // for searching functionality to search 
    // after the user has stopped typing for 300ms 
    // then run the search function
    const newValue = e.target.value;
    setSearchValue(newValue);
    console.log("Search input:", newValue); // debugging purpose
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
          onKeyPress={handleKeyPress}
        />
        <div className="flex items-center justify-center rounded-r-xl border-l-0 border border-[#d0dde7] bg-slate-50 pr-[7px]">
          <button
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl 
            bg-[#47a6ea] text-[#0e151b] font-bold leading-normal tracking-[0.015em] ${currentSize.button}`}
            onClick={handleSearch}
          >
            <span className="truncate">Search</span>
          </button>
        </div>
      </div>
    </label>
  );
};

export default SearchBar;

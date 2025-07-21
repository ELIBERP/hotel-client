import React from 'react';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import destinations from '../assets/destinations.json';

const Landing = () => {
    // const handleSearch = (searchQuery) => {
    //     console.log('Searching for:', searchQuery);
    //     // Here you can add your search logic, like:
    //     // - Navigate to search results page
    //     // - Call an API to search for hotels
    //     // - Filter results, etc.
    // };
    const navigate = useNavigate();

  const handleSearch = (searchQuery) => {
    const destination = destinations.find(d =>
      d.term.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (destination) {
      navigate(`/searchResults/${destination.uid}`);
    } else {
      alert("Destination not found");
    }
  };
    
    return (
        <div className="px-40 flex flex-1 justify-center py-5 min-h-[500px]">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <div className="@container">
                    <div className="@[480px]:p-4">
                        <div
                            className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                            style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDCH46PuDZLq3MOLONfcyjYypdWbamDXXs1V_N0H6i3WRRmVP7V9B0Lr4S4g8ZXohyihui6-ci29cnT0jrVwM8HrN6J_BOxxmEwQm18hX5RvX8EJtytu6LLTPYRQFEBv3saxfFlrnqYkmjeU8_m_jyNu6bpDZv8B1-ZMNi1o4-rnix88aqXnY_UEums20jNJKEvxB6kdpqmnCGGhtfnckWNK6lEH7dordLip_jNcYUOFDDXQXHaDc328TQjABnvH1DiAIZQa9g32xHb")'}}
                        >
                            <div className="flex flex-col gap-2 text-center">
                                <h1
                                    className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                                >
                                    Find your next stay
                                </h1>
                                <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                                    Search deals on hotels, homes, and much more...
                                </h2>
                            </div>
                            <SearchBar 
                                placeholder="Where to next?"
                                onSearch={handleSearch}
                                size="large"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;

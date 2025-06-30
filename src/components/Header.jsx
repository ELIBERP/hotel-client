import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef3] px-10 py-3">
      <div className="flex items-center gap-4 text-[#0e151b]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <Link to="/" className="text-[#0e151b] text-lg font-bold leading-tight tracking-[-0.015em] hover:text-[#47a6ea] transition-colors">
          StayEase
        </Link>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link className="text-[#0e151b] text-sm font-medium leading-normal hover:text-[#47a6ea] transition-colors" to="/stays">
            Stays
          </Link>
          <a className="text-[#0e151b] text-sm font-medium leading-normal hover:text-[#47a6ea] transition-colors" href="#flights">
            Flights
          </a>
          <a className="text-[#0e151b] text-sm font-medium leading-normal hover:text-[#47a6ea] transition-colors" href="#car-rentals">
            Car rentals
          </a>
          <a className="text-[#0e151b] text-sm font-medium leading-normal hover:text-[#47a6ea] transition-colors" href="#attractions">
            Attractions
          </a>
          <Link className="text-[#0e151b] text-sm font-medium leading-normal hover:text-[#47a6ea] transition-colors" to="/about">
            About
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7eef3] text-[#0e151b] text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">List your property</span>
          </button>
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#e7eef3] text-[#0e151b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
          >
            <div className="text-[#0e151b]" data-icon="Globe" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,202.87,128,215.89,116,202.87,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154.37,88H101.63C107,69.66,116,53.13,128,40.11,140,53.13,149,69.66,154.37,88Zm19.84,16h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.16-16H170.94a142.39,142.39,0,0,0-20.26-45A88.37,88.37,0,0,1,206.37,88ZM105.32,43A142.39,142.39,0,0,0,85.06,88H49.63A88.37,88.37,0,0,1,105.32,43ZM49.63,168H85.06a142.39,142.39,0,0,0,20.26,45A88.37,88.37,0,0,1,49.63,168Zm101.05,45a142.39,142.39,0,0,0,20.26-45h35.43A88.37,88.37,0,0,1,150.68,213Z"
                ></path>
              </svg>
            </div>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXgYImwlX-fFw7XhjuXj-cxJdnA_55zAVpHNf8GerRbjt8ZwjX1WtwZ9_UInMscoatL6QNuxNChM4KTs1HnGRplpI4FT-RGv2F_uz0_oPwh9U8yKC5ub82xlhzmlIBhVfFdjrx_xz63RruDOOTg1WsVf9bwN0vYHcaE_s0GK8xJytWdzqWLN46X80TZ7t-lrx8Xaf14ggSWeabegt_7iVi2iVo-ZRLRkwIPwrAsXgFPKIIHJgw97brWfNTUR-f3MUq21A1ue-dfhPy")'}}
        ></div>
      </div>
    </header>
  );
};

export default Header;

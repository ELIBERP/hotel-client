import React from 'react';

const About = () => {
  return (
    <div className="px-40 flex flex-1 justify-center py-10">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#0e151b] mb-6">About StayEase</h1>
          <p className="text-lg text-[#4e7997] mb-4">
            Welcome to StayEase, your trusted partner in finding the perfect accommodation for your travels.
          </p>
          <p className="text-base text-[#4e7997] mb-4">
            We connect travelers with amazing places to stay, from cozy apartments to luxury hotels, 
            ensuring you have a comfortable and memorable experience wherever you go.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e7eef3]">
              <h3 className="text-xl font-semibold text-[#0e151b] mb-2">Trusted Hosts</h3>
              <p className="text-[#4e7997]">All our properties are verified and hosted by trusted partners.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e7eef3]">
              <h3 className="text-xl font-semibold text-[#0e151b] mb-2">Best Prices</h3>
              <p className="text-[#4e7997]">We guarantee competitive pricing for all accommodations.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e7eef3]">
              <h3 className="text-xl font-semibold text-[#0e151b] mb-2">24/7 Support</h3>
              <p className="text-[#4e7997]">Our customer support team is available around the clock.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

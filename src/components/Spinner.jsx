import React from "react";

const Spinner = ({ size = 24, className = "" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`inline-block text-blue-500 ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="w-full h-full rounded-full border-2 border-current opacity-25" />
    <div className="w-full h-full -mt-[100%] rounded-full border-2 border-current border-t-transparent animate-spin" />
  </div>
);

export default Spinner;
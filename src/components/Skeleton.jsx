import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default Skeleton;
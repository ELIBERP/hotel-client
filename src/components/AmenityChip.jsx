// src/components/AmenityChip.jsx
import React from 'react';
import { AMENITY_MAP } from '../constants/amenities';

const SIZES = {
  sm: { icon: 'text-[14px]', pad: 'px-2 py-0.5', text: 'text-[11px]' },
  md: { icon: 'text-[16px]', pad: 'px-2.5 py-1', text: 'text-xs' },
  lg: { icon: 'text-[20px]', pad: 'px-3 py-1.5', text: 'text-sm' },
};

export default function AmenityChip({
  k,
  size = 'md',
  showLabel = true,
  tooltip = true,
  className = '',
}) {
  const meta = AMENITY_MAP[k];
  if (!meta) return null;
  const s = SIZES[size] || SIZES.md;
  const tooltipText = meta.desc || meta.label;

  return (
    <span
      className={`relative group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white ${s.pad} ${s.text} text-gray-700 ${className}`}
      aria-label={meta.label}
      title={!tooltip ? tooltipText : undefined} // fallback native title if tooltip disabled
    >
      <span className={`material-symbols-outlined leading-none ${s.icon}`}>
        {meta.icon}
      </span>
      {showLabel && <span>{meta.label}</span>}

      {tooltip && (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {tooltipText}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/80" />
        </span>
      )}
    </span>
  );
}

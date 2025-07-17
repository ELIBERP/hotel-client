// StarRating.jsx
import React from 'react';

const Star = ({ fill = 0, color = 'gray', index = 0 }) => {
  const fillPercent = Math.round(fill * 100);
  const gradientId = `starFill-${index}-${color.replace('#', '')}-${fillPercent}`;

  return (
    <svg
      className="w-6 h-6 mr-1"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset={`${fillPercent}%`} stopColor={color} />
          <stop offset={`${fillPercent}%`} stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        stroke="#ccc"
        strokeWidth="1"
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.168L12 18.896 4.666 23.16l1.4-8.168L.132 9.21l8.2-1.192z"
      />
    </svg>
  );
};


const StarRating = ({ rating }) => {
  const getColor = (r) => {
    if (r <= 1) return '#ef4444'; // red
    if (r <= 3) return '#facc15'; // yellow
    return '#22c55e'; // green
  };

  const color = getColor(rating); // color based on whole rating

  const stars = Array.from({ length: 5 }, (_, i) => {
    const diff = rating - i;
    const fill = diff >= 1 ? 1 : diff > 0 ? diff : 0;
    return <Star key={i} fill={fill} color={color} index={i} />;
  });
  return <div className="flex items-center">{stars}</div>;
};

export default StarRating;

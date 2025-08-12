// components/RoomGrid.jsx
import React from 'react';
import AmenityChip from './AmenityChip';

const RoomGrid = ({ rooms = [], loading = false, onRoomClick, roomHideKeys }) => {
  const extractBedAndSize = (long_description) => {
    if (!long_description) return { bedInfo: '', sizeInfo: '' };
    const div = document.createElement('div');
    div.innerHTML = long_description;
    const pTags = div.querySelectorAll('p');
    const bedInfo = pTags[0]?.textContent || '';
    const sizeInfo = pTags[1]?.textContent || '';
    return { bedInfo, sizeInfo };
  };

  if (loading) return null;
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return <p>No rooms available for selected filter.</p>;
  }

  const hideSet =
    roomHideKeys instanceof Set
      ? roomHideKeys
      : new Set(Array.isArray(roomHideKeys) ? roomHideKeys : []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room, idx) => {
        const { bedInfo, sizeInfo } = extractBedAndSize(room?.long_description);
        const breakfastRaw = room?.roomAdditionalInfo?.breakfastInfo;
        const breakfast =
          breakfastRaw === 'hotel_detail_room_only'
            ? 'No breakfast'
            : (breakfastRaw ? 'Breakfast included' : '—');

        const keys = Array.isArray(room?.importantAmenityKeys) ? room.importantAmenityKeys : [];
        const visible = keys.filter(k => !hideSet.has(k)).slice(0, 6);

        return (
          <div key={idx} className="border rounded-2xl shadow-sm">
            <div className="h-48 overflow-hidden rounded-t-2xl">
              <img
                src={room?.images?.[0]?.high_resolution_url || room?.images?.[0]?.url}
                alt={`Room ${idx}`}
                className="h-48 w-full object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-[#0e151b] mb-1">
                {room?.roomDescription || 'Room Name Placeholder'}
              </h3>

              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>{bedInfo}</p>
                <p>{sizeInfo}</p>
                <p>{breakfast}</p>
                <p>{room?.free_cancellation ? 'Free cancellation' : 'No cancellation'}</p>
                <p>
                  Price: <strong>{room?.converted_price} {room?.converted_price ? 'SGD' : ''}</strong>
                </p>
              </div>

              {visible.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {visible.map(k => (
                    <AmenityChip key={k} k={k} size="sm" withTooltip />
                  ))}
                </div>
              )}

              <button
                onClick={() => onRoomClick?.(room)}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomGrid;

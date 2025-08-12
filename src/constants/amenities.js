// src/constants/amenities.js

export const AMENITY_MAP = {
  airConditioning:      { label: 'A/C',        icon: 'ac_unit',            desc: 'Air conditioning available' },
  clothingIron:         { label: 'Iron',       icon: 'iron',               desc: 'Clothing iron available if requested' },
  continentalBreakfast: { label: 'Breakfast',  icon: 'free_breakfast',     desc: 'Continental breakfast available' },
  dataPorts:            { label: 'Data',       icon: 'settings_ethernet',  desc: 'Wired data/ethernet available' },
  dryCleaning:          { label: 'Dry Cleaning', icon: 'local_laundry_service', desc: 'Dry cleaning service available' },
  hairDryer:            { label: 'Hair Dryer', icon: 'dry',                desc: 'Hair dryer available' },
  miniBarInRoom:        { label: 'Mini Bar',   icon: 'local_bar',          desc: 'In-room mini bar' },
  outdoorPool:          { label: 'Pool',       icon: 'pool',               desc: 'Outdoor pool available' },
  parkingGarage:        { label: 'Parking',    icon: 'local_parking',      desc: 'Parking garage available' },
  roomService:          { label: 'Room Service', icon: 'room_service',     desc: 'Room service available' },
  safe:                 { label: 'Safe',       icon: 'lock',               desc: 'In-room safe' },
  tVInRoom:             { label: 'TV',         icon: 'tv',                 desc: 'TV in room' },

  // room-level items
  wifi:                 { label: 'Wi-Fi',      icon: 'wifi',               desc: 'Wi-Fi internet access available' },
  coffeeTeaMaker:       { label: 'Coffee/Tea', icon: 'coffee_maker',       desc: 'Coffee/tea maker in room' },
  electricKettle:       { label: 'Kettle',     icon: 'emoji_food_beverage',desc: 'Electric kettle in room' },
  wheelchairAccessible: { label: 'Accessible', icon: 'accessible',         desc: 'Wheelchair accessible' },
};


const ROOM_AMENITY_MATCHERS = {
  wifi: [
    'wifi', 'wi-fi', 'wireless internet', 'wireless internet access',
    'free wifi', 'free wi-fi', 'free wired internet',
    'wifi speed - 50+ mbps', 'wifi speed - 100+ mbps'
  ],
  airConditioning:      ['air conditioning', 'air-conditioned', 'air conditioned'],
  coffeeTeaMaker:       ['coffee/tea maker', 'tea/coffee maker', 'coffee maker', 'tea maker'],
  hairDryer:            ['hair dryer', 'hairdryer'],
  electricKettle:       ['electric kettle'],
  wheelchairAccessible: ['wheelchair accessible', 'wheelchair-accessible'],
};


const normalizeAmenityList = (amenities) =>
  Array.isArray(amenities) ? amenities : [];

export const roomAmenityKeys = (amenities) => {
  const lower = normalizeAmenityList(amenities).map(a => String(a).toLowerCase());
  const keys = new Set();

  Object.entries(ROOM_AMENITY_MATCHERS).forEach(([key, needles]) => {
    const needlesLower = needles.map(n => n.toLowerCase());
    if (lower.some(s => needlesLower.some(n => s.includes(n)))) {
      keys.add(key);
    }
  });

  return Array.from(keys);
};
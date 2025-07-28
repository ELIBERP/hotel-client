// utils/pricing.js
export const calculateNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const calculateTotalPrice = (pricePerNight, numberOfNights, numberOfGuests) => {
  let total = pricePerNight * numberOfNights;
  
  // Add extra guest fees (if more than 2 guests)
  if (numberOfGuests > 2) {
    const extraGuestFee = 25; // $25 per extra guest per night
    total += (numberOfGuests - 2) * extraGuestFee * numberOfNights;
  }
  
  return total;
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validateBookingData = (bookingData) => {
  const required = ['hotelName', 'roomType', 'checkInDate', 'checkOutDate', 'pricePerNight'];
  const missing = required.filter(field => !bookingData[field]);
  
  if (missing.length > 0) {
    return { valid: false, errors: missing.map(field => `${field} is required`) };
  }
  
  // Validate dates
  const checkIn = new Date(bookingData.checkInDate);
  const checkOut = new Date(bookingData.checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkIn < today) {
    return { valid: false, errors: ['Check-in date cannot be in the past'] };
  }
  
  if (checkOut <= checkIn) {
    return { valid: false, errors: ['Check-out date must be after check-in date'] };
  }
  
  return { valid: true, errors: [] };
};

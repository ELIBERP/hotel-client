import { useState } from "react";
import ApiService from "../services/api";

const BookingForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    specialRequest: "",
    creditCard: "",
    expiry: "",
    cvv: "",
    billingAddress: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload
    const bookingData = {
      guest: {
        salutation: "Mr", // Static for demo
        firstName: formData.firstName,
        lastName: formData.lastName
      },
      contact: {
        phone: formData.phone,
        email: formData.email
      },
      message: formData.specialRequest,
      payment: {
        cardNumber: formData.creditCard,
        expiry: formData.expiry,
        cvv: formData.cvv,
        billingAddress: formData.billingAddress
      },
      price: 250, // Static for demo
      destinationId: "DEST123",
      hotelId: "HOTEL456",
      roomType: "Deluxe"
    };

    try {
      const response = await ApiService.createBooking(bookingData);
      alert(`✅ Booking Successful!\nReference: ${response.bookingReference}`);
    } catch (error) {
      alert("❌ Booking failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-4 rounded">
      <input name="firstName" placeholder="First Name" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full p-2 border rounded" required />
      <textarea name="specialRequest" placeholder="Special Requests" onChange={handleChange} className="w-full p-2 border rounded" />

      <hr className="my-4" />

      <input name="creditCard" placeholder="Credit Card Number" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="expiry" placeholder="Expiry (MM/YY)" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="cvv" placeholder="CVV" onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="billingAddress" placeholder="Billing Address" onChange={handleChange} className="w-full p-2 border rounded" required />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Booking
      </button>
    </form>
  );
};

export default BookingForm;

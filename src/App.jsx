import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Landing from "./pages/LandingContent";
import About from "./pages/About";
import Stays from "./pages/Stays";
import HotelDetails from "./pages/HotelDetails";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancel from "./pages/BookingCancel";
import TestPayment from "./pages/TestPayment";
import BookingForm from "./pages/BookingForm";
import BookingDemo from "./pages/BookingDemo";
import { logEnvironmentInfo } from "./config/env";
import CreateBooking from "./pages/CreateBooking";


const App = () => {
  useEffect(() => {
    // Log environment info in development
    logEnvironmentInfo();
  }, []);

  return (
    <Router>
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/about" element={<About />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/booking" element={<CreateBooking />} />
              <Route path="/booking-form" element={<BookingForm />} />
              <Route path="/booking-demo" element={<BookingDemo />} />
              <Route path="/test-payment" element={<TestPayment />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/booking-cancel" element={<BookingCancel />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App;

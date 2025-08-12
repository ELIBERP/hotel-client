import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/LandingContent";
import About from "./pages/About";
import Stays from "./pages/Stays";
import HotelDetails from "./pages/HotelDetails";
import HotelSearchResults from './pages/HotelSearchResults';
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancel from "./pages/BookingCancel";
import TestPayment from "./pages/TestPayment";
import BookingForm from "./pages/BookingForm";
import BookingDemo from "./pages/BookingDemo";
import CreateBooking from "./pages/CreateBooking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { logEnvironmentInfo } from "./config/env";

const App = () => {
  useEffect(() => {
    // Log environment info in development
    logEnvironmentInfo();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="relative flex size-full h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}>
          <div className="layout-container flex h-full grow flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/stays" element={<Stays />} />
                <Route path="/about" element={<About />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
                <Route path="/search" element={<HotelSearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/booking" 
                  element={
                    <ProtectedRoute>
                      <CreateBooking />
                    </ProtectedRoute>
                  } 
                />
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
    </AuthProvider>
  );
};

export default App;

import { useState, useEffect } from "react";
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
        <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}>
          <div className="layout-container flex h-full grow flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/stays" element={<Stays />} />
                <Route path="/about" element={<About />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
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

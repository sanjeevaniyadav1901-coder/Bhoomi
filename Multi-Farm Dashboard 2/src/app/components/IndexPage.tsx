import { useState } from "react";
import { ArrowRight, Mail, Phone, Leaf, Target, Users } from "lucide-react";
import { Sidebar, SidebarPage } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { LoginPage } from "./LoginPage";
import { ChatBot } from "./ChatBot";

interface IndexPageProps {
  onGetStarted?: () => void;
}

export function IndexPage({ onGetStarted }: IndexPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [currentPage, setCurrentPage] = useState<SidebarPage>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('bhoomi_current_user');
    setIsLoggedIn(false);
    setUserEmail('');
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: SidebarPage) => {
    console.log('📍 Navigating to:', page);
    setCurrentPage(page);
  };

  // If showing login page
  if (showLogin) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onBackToHome={() => setShowLogin(false)}
      />
    );
  }

  // If logged in, show dashboard with sidebar and chatbot
  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userName={userEmail.split('@')[0]}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 lg:ml-64 relative">
          <Dashboard 
            userEmail={userEmail}
            currentPage={currentPage}
            onNavigate={handleNavigate}
          />
          {/* ChatBot - Floating assistant for farmers */}
          <ChatBot 
            farmerName={userEmail.split('@')[0]}
            farmId="farm-1"
          />
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <div className="min-h-screen relative">
      {/* Hero Section with Background */}
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url(/88211bdc9aa4a789d3e4be447a4f26ec9e555dc2.png)" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="flex items-center justify-between px-8 lg:px-16 py-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            </div>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 lg:px-6 py-2 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-all backdrop-blur-sm shadow-md"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about-us')}
                className="px-4 lg:px-6 py-2 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-all backdrop-blur-sm shadow-md"
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('contact-us')}
                className="px-4 lg:px-6 py-2 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-all backdrop-blur-sm shadow-md"
              >
                Contact Us
              </button>
            </div>

            {/* Menu Icon */}
            <button className="p-3 hover:bg-white/10 rounded-lg transition-colors">
              <div className="space-y-1.5">
                <div className="w-7 h-0.5 bg-white"></div>
                <div className="w-7 h-0.5 bg-white"></div>
                <div className="w-7 h-0.5 bg-white"></div>
              </div>
            </button>
          </nav>

          {/* Hero Content - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-20">
            <h1
              className="text-7xl md:text-8xl lg:text-9xl text-white mb-4 lg:mb-6 tracking-wider"
              style={{
                fontWeight: 900,
                letterSpacing: "0.05em",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              BHOOMI
            </h1>
            <p
              className="text-xl md:text-2xl lg:text-3xl text-white mb-8 lg:mb-12"
              style={{
                fontWeight: 400,
                letterSpacing: "0.02em",
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              "Your Personal Agro Partner"
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-3 px-8 lg:px-10 py-3 lg:py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all text-base lg:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              style={{ fontWeight: 600 }}
            >
              Sign-up
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section 
        id="about-us" 
        className="min-h-screen relative bg-cover bg-center"
        style={{ backgroundImage: "url(/88211bdc9aa4a789d3e4be447a4f26ec9e555dc2.png)" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/90 rounded-full mb-8 backdrop-blur-sm shadow-xl">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl text-white mb-8"
              style={{
                fontWeight: 800,
                letterSpacing: "0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              About Us
            </h2>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 lg:p-12 shadow-2xl">
              <p className="text-lg lg:text-xl text-gray-800 leading-relaxed mb-6">
                At <span className="text-green-700" style={{ fontWeight: 700 }}>Bhoomi</span>, we are dedicated to revolutionizing Indian agriculture by addressing the diverse challenges faced by farmers across the nation.
              </p>
              <p className="text-lg lg:text-xl text-gray-800 leading-relaxed">
                Our mission is to enhance crop yields, improve soil fertility, and boost overall agricultural productivity.
              </p>
              
              {/* Mission Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <Target className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Enhance Yields</h3>
                  <p className="text-sm text-gray-600">Maximize crop production with smart technology</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <Leaf className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Improve Soil</h3>
                  <p className="text-sm text-gray-600">Monitor and enhance soil fertility</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Support Farmers</h3>
                  <p className="text-sm text-gray-600">Empower farmers with data-driven insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section 
        id="contact-us" 
        className="min-h-screen relative bg-gradient-to-br from-green-800 via-green-700 to-green-900"
      >
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center w-full">
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl text-white mb-12"
              style={{
                fontWeight: 800,
                letterSpacing: "0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              Contact Us
            </h2>
            
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 lg:p-12 shadow-2xl">
              <p className="text-lg text-gray-700 mb-10">
                Get in touch with us for any queries or support
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Email */}
                <a 
                  href="mailto:adityajagtap058@gmail.com"
                  className="flex items-center gap-4 p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="text-gray-900" style={{ fontWeight: 600 }}>
                      adityajagtap058@gmail.com
                    </div>
                  </div>
                </a>
                
                {/* Phone */}
                <a 
                  href="tel:7988366083"
                  className="flex items-center gap-4 p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-600 mb-1">Phone</div>
                    <div className="text-gray-900" style={{ fontWeight: 600 }}>
                      7988366083
                    </div>
                  </div>
                </a>
              </div>
              
              {/* Additional Info */}
              <div className="mt-10 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <p className="text-gray-700">
                  We're here to help you transform your agricultural practices with smart technology
                </p>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={() => setShowLogin(true)}
                className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ fontWeight: 600 }}
              >
                Get Started with Bhoomi
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🌾</span>
            <span className="text-xl" style={{ fontWeight: 700 }}>BHOOMI</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Bhoomi. Your Personal Agro Partner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
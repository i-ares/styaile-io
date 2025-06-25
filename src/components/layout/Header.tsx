import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, ShoppingBag, Heart, Globe, MessageCircle, Grid3X3, Home, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { user, isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    alert('Sign in functionality would be implemented with Supabase authentication');
  };

  const isHomePage = location.pathname === '/';

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isHomePage ? 'bg-transparent' : 'bg-white/95 backdrop-blur-xl border-b border-gray-100'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button 
              onClick={() => handleNavigation('/')}
              className={`text-2xl font-extralight tracking-[0.2em] transition-colors duration-300 ${
                isHomePage ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              STAILE.IO
            </motion.button>
            <div className="hidden lg:flex items-center space-x-12">
              <motion.button
                onClick={() => handleNavigation('/chat')}
                className={`text-sm font-light tracking-[0.1em] uppercase transition-colors duration-300 ${
                  location.pathname === '/chat' 
                    ? (isHomePage ? 'text-white border-b border-white' : 'text-black border-b border-black')
                    : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black')
                }`}
                whileHover={{ y: -1 }}
              >
                AI Assistant
              </motion.button>
              <motion.button
                onClick={() => handleNavigation('/recommendations')}
                className={`text-sm font-light tracking-[0.1em] uppercase transition-colors duration-300 ${
                  location.pathname === '/recommendations' 
                    ? (isHomePage ? 'text-white border-b border-white' : 'text-black border-b border-black')
                    : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black')
                }`}
                whileHover={{ y: -1 }}
              >
                Collections
              </motion.button>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`hidden md:flex items-center space-x-2 text-sm font-light tracking-wide ${
                isHomePage ? 'text-white/80' : 'text-gray-600'
              }`}>
                <Globe className="w-4 h-4" />
                <span>IN (INR ₹)</span>
              </div>
              <motion.button
                className={`p-2 transition-colors duration-300 ${
                  isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Search className="w-5 h-5" />
              </motion.button>
              {isAuthenticated && user ? (
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || ''}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className={`hidden md:block text-sm font-light tracking-wide ${
                    isHomePage ? 'text-white' : 'text-black'
                  }`}>Account</span>
                </motion.div>
              ) : (
                <motion.button
                  onClick={handleSignIn}
                  className={`text-sm font-light tracking-[0.1em] uppercase transition-colors duration-300 ${
                    isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Account
                </motion.button>
              )}
              <motion.button
                className={`relative p-2 transition-colors duration-300 ${
                  isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                  isHomePage ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  0
                </span>
              </motion.button>
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 transition-colors duration-300 ${
                  isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          y: isMobileMenuOpen ? 0 : -20,
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-white lg:hidden"
        style={{ top: '80px' }}
      >
        <div className="px-6 py-8 space-y-8">
          <motion.button
            onClick={() => handleNavigation('/chat')}
            className="block w-full text-left text-lg font-light tracking-wide text-black hover:text-gray-600 transition-colors"
            whileHover={{ x: 10 }}
          >
            AI Assistant
          </motion.button>
          <motion.button
            onClick={() => handleNavigation('/recommendations')}
            className="block w-full text-left text-lg font-light tracking-wide text-black hover:text-gray-600 transition-colors"
            whileHover={{ x: 10 }}
          >
            Collections
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
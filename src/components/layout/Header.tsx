import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Header = () => {
  const { currentUser, logout, userRoles } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Krishna Nagar';
    if (path.includes('/events')) return 'Events';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/chat')) return 'Community Chat';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/login')) return 'Login';
    if (path.includes('/register')) return 'Register';
    return 'Krishna Nagar';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-gradient-to-r from-emerald-600 to-teal-500'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Home 
                size={20} 
                className={`${isScrolled ? 'text-emerald-600' : 'text-emerald-600'}`} 
              />
            </div>
            <h1 className={`ml-2 font-bold text-xl ${isScrolled ? 'text-emerald-600' : 'text-white'}`}>
              {getPageTitle()}
            </h1>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className={`${isScrolled ? 'text-emerald-600' : 'text-white'}`} />
            ) : (
              <Menu className={`${isScrolled ? 'text-emerald-600' : 'text-white'}`} />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {currentUser ? (
              <>
                <span className={`${isScrolled ? 'text-emerald-800' : 'text-white'}`}>
                  {currentUser.email}
                </span>
                {userRoles.isAdmin && (
                  <Link 
                    to="/events/add" 
                    className={`font-medium ${isScrolled ? 'text-emerald-600 hover:text-emerald-800' : 'text-white hover:text-emerald-100'}`}
                  >
                    Add Event
                  </Link>
                )}
                {userRoles.isEntrepreneur && (
                  <Link 
                    to="/products/add" 
                    className={`font-medium ${isScrolled ? 'text-emerald-600 hover:text-emerald-800' : 'text-white hover:text-emerald-100'}`}
                  >
                    Add Product
                  </Link>
                )}
                <button 
                  onClick={() => logout()}
                  className={`font-medium ${isScrolled ? 'text-emerald-600 hover:text-emerald-800' : 'text-white hover:text-emerald-100'}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`font-medium ${isScrolled ? 'text-emerald-600 hover:text-emerald-800' : 'text-white hover:text-emerald-100'}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    isScrolled 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-white text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t"
        >
          <div className="px-4 py-2 space-y-3">
            {currentUser ? (
              <>
                <div className="px-2 py-3 text-emerald-800 font-medium border-b">
                  {currentUser.email}
                </div>
                {userRoles.isAdmin && (
                  <Link 
                    to="/events/add" 
                    className="block px-2 py-3 text-emerald-600 hover:bg-emerald-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Event
                  </Link>
                )}
                {userRoles.isEntrepreneur && (
                  <Link 
                    to="/products/add" 
                    className="block px-2 py-3 text-emerald-600 hover:bg-emerald-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Product
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-3 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-2 py-3 text-emerald-600 hover:bg-emerald-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-2 py-3 text-emerald-600 hover:bg-emerald-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
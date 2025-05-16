import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, ShoppingBag, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { currentUser, userRoles, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setLoggingOut(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-6 flex items-center justify-center">
          <User size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-6">
          Please sign in to access your profile and manage your content.
        </p>
        <div className="flex flex-col space-y-3 max-w-xs mx-auto">
          <Link 
            to="/login" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium py-3 px-6 rounded-lg transition-colors text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
            <User size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{currentUser.email}</h1>
          <p className="text-emerald-100">
            {userRoles.isAdmin && 'Administrator'}
            {userRoles.isEntrepreneur && 'Entrepreneur'}
            {!userRoles.isAdmin && !userRoles.isEntrepreneur && 'User'}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {userRoles.isAdmin && (
              <Link 
                to="/events/add" 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <Calendar size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Add Event</h2>
                    <p className="text-gray-600">Create a community event</p>
                  </div>
                </div>
              </Link>
            )}
            
            {userRoles.isEntrepreneur && (
              <Link 
                to="/products/add" 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <ShoppingBag size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Add Product</h2>
                    <p className="text-gray-600">List your product or service</p>
                  </div>
                </div>
              </Link>
            )}
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-400 transition-colors">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <Settings size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-800">Settings</h2>
                  <p className="text-gray-600">Manage your account settings</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
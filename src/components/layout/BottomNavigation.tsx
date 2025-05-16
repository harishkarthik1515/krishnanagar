import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 z-50">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center justify-center relative"
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="navigationIndicator"
                className="absolute inset-0 bg-emerald-50 rounded-md"
                initial={false}
                transition={{ type: 'spring', duration: 0.3 }}
              />
            )}
            <div className="flex flex-col items-center justify-center relative z-10">
              <item.icon 
                size={20} 
                className={isActive(item.path) ? 'text-emerald-600' : 'text-gray-500'} 
              />
              <span className={`text-xs mt-1 ${isActive(item.path) ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
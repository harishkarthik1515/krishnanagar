import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import WelcomeCard from '../components/home/WelcomeCard';
import { CalendarDays, ShoppingBag, MessageCircle, Sparkles, Users } from 'lucide-react';

interface EventPreview {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  location?: string;
}

interface ProductPreview {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

const HomePage = () => {
  const [recentEvents, setRecentEvents] = useState<EventPreview[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date', 'desc'),
          limit(3)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          date: doc.data().date,
          imageUrl: doc.data().imageUrl,
          location: doc.data().location
        }));
        
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          imageUrl: doc.data().imageUrl
        }));
        
        setRecentEvents(eventsData);
        setRecentProducts(productsData);
      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <WelcomeCard />
      
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <CalendarDays size={20} className="mr-2 text-emerald-600" />
            Recent Events
          </h2>
          <Link to="/events" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : recentEvents.length > 0 ? (
          <motion.div 
            className="grid gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {recentEvents.map(event => (
              <motion.div 
                key={event.id}
                variants={item}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-md overflow-hidden"
              >
                <Link to={`/events/${event.id}`} className="flex flex-col md:flex-row">
                  {event.imageUrl ? (
                    <div className="md:w-1/3 h-48 md:h-32 overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  
                  <div className={`p-4 flex flex-col justify-center ${event.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                    <h3 className="font-medium text-gray-800 hover:text-emerald-600 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{new Date(event.date).toLocaleDateString()}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500 truncate">{event.location}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg text-center"
          >
            <Sparkles size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-emerald-800 mb-2">Exciting Times Ahead!</h3>
            <p className="text-emerald-600 mb-4">
              Be the first to know about upcoming community events and gatherings.
            </p>
            <Link 
              to="/events" 
              className="inline-flex items-center text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Explore Events →
            </Link>
          </motion.div>
        )}
      </motion.section>
      
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingBag size={20} className="mr-2 text-emerald-600" />
            Local Products
          </h2>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ) : recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentProducts.map(product => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="h-32 bg-gray-200 relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ShoppingBag size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-emerald-600 font-semibold">₹{product.price}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg text-center"
          >
            <Users size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-emerald-800 mb-2">Support Local Businesses</h3>
            <p className="text-emerald-600 mb-4">
              Discover amazing products and services from your neighbors.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Browse Products →
            </Link>
          </motion.div>
        )}
      </motion.section>
      
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-xl shadow-lg relative overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"
        />
        
        <div className="relative">
          <div className="flex items-center mb-4">
            <MessageCircle size={24} className="text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Community Chat</h2>
          </div>
          
          <p className="text-emerald-50 mb-6">
            Connect with your neighbors in our public chat area. Share updates, ask questions, and stay connected.
          </p>
          
          <Link 
            to="/chat" 
            className="inline-block bg-white text-emerald-600 hover:bg-emerald-50 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Join the Conversation
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
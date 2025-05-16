import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, Clock, MapPin, ArrowRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRoles } = useAuth();
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date', 'asc')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 text-center">
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h2>
        <p className="text-gray-500 mb-6">There are currently no upcoming events to display.</p>
        
        {userRoles.isAdmin && (
          <Link 
            to="/events/add" 
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-1" />
            <span>Create New Event</span>
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
        
        {userRoles.isAdmin && (
          <Link 
            to="/events/add"
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-1" />
            <span>Add Event</span>
          </Link>
        )}
      </div>
      
      <div className="space-y-4">
        {events.map(event => {
          const eventDate = new Date(event.date);
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <Link to={`/events/${event.id}`} className="block hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row">
                  {event.imageUrl && (
                    <div className="md:w-1/4 h-40 md:h-auto overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className={`p-6 ${event.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                      <div className="flex items-center mr-4 mb-2">
                        <Calendar size={14} className="mr-1 text-emerald-600" />
                        <span>{format(eventDate, 'MMM d, yyyy')}</span>
                      </div>
                      
                      {event.time && (
                        <div className="flex items-center mr-4 mb-2">
                          <Clock size={14} className="mr-1 text-emerald-600" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center mb-2">
                          <MapPin size={14} className="mr-1 text-emerald-600" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center text-emerald-600 font-medium">
                      <span>View Details</span>
                      <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Globe, Trash, ArrowLeft, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  formLink?: string;
  imageUrl?: string;
  createdBy: string;
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { userRoles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const eventRef = doc(db, 'events', id);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data()
          } as Event);
        } else {
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this event?')) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'events', id));
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-gray-500 mb-2">Event Not Found</h3>
        <Link 
          to="/events" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to="/events" 
        className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to Events</span>
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {event.imageUrl && (
          <div className="w-full h-64 overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="bg-emerald-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap items-center text-emerald-50">
            <div className="flex items-center mr-4 mb-2">
              <Calendar size={16} className="mr-1" />
              <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            {event.time && (
              <div className="flex items-center mr-4 mb-2">
                <Clock size={16} className="mr-1" />
                <span>{event.time}</span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center mb-2">
                <Globe size={16} className="mr-1" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{event.description}</p>
          </div>
          
          {event.formLink && (
            <div className="mt-8">
              <a 
                href={event.formLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>Register for Event</span>
                <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          )}
          
          {userRoles.isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash size={16} className="mr-2" />
                <span>{deleting ? 'Deleting...' : 'Delete Event'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetailPage;
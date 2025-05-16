import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, ExternalLink, MapPin, ChevronLeft, Image } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  formLink?: string;
}

const AddEventPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!currentUser) return;
    
    try {
      setSubmitting(true);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (imageFile) {
        const imageRef = ref(storage, `events/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
      
      await addDoc(collection(db, 'events'), {
        ...data,
        imageUrl,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      navigate('/events');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => navigate('/events')}
        className="flex items-center text-emerald-600 hover:text-emerald-800 mb-6"
      >
        <ChevronLeft size={20} />
        <span>Back to Events</span>
      </button>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Event</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title*
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Community Gathering"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Image size={16} className="mr-1 text-emerald-600" />
                <span>Event Image (optional)</span>
              </div>
            </label>
            
            <div className="mt-1 flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="event-image"
              />
              
              <label
                htmlFor="event-image"
                className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Choose Image
              </label>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="ml-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
            
            {imagePreview && (
              <div className="mt-3">
                <div className="relative w-full h-40 overflow-hidden rounded-lg border border-gray-200">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Preview of selected image
                </p>
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              Recommended image size: 1200x630 pixels. Maximum size: 5MB
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-emerald-600" />
                  <span>Date*</span>
                </div>
              </label>
              <input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-emerald-600" />
                  <span>Time (optional)</span>
                </div>
              </label>
              <input
                id="time"
                type="time"
                {...register('time')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-emerald-600" />
                <span>Location (optional)</span>
              </div>
            </label>
            <input
              id="location"
              type="text"
              {...register('location')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Community Park, Krishna Nagar"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Provide details about the event..."
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="formLink" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <ExternalLink size={16} className="mr-1 text-emerald-600" />
                <span>Google Form Link (optional)</span>
              </div>
            </label>
            <input
              id="formLink"
              type="url"
              {...register('formLink')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="https://forms.google.com/..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Add a Google Form link for event registration or participation
            </p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
            >
              {submitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;
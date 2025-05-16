import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { ShoppingBag, Upload, ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  sellerName: string;
  sellerContact?: string;
  sellerEmail?: string;
}

const AddProductPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const storageRef = ref(storage, `products/${fileName}`);
    
    await uploadBytes(storageRef, imageFile);
    return getDownloadURL(storageRef);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!currentUser) return;
    
    try {
      setSubmitting(true);
      
      // Upload image if provided
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      await addDoc(collection(db, 'products'), {
        ...data,
        price: Number(data.price),
        imageUrl,
        sellerId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => navigate('/products')}
        className="flex items-center text-emerald-600 hover:text-emerald-800 mb-6"
      >
        <ChevronLeft size={20} />
        <span>Back to Products</span>
      </button>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Product name is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Handmade Craft"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)*
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be a positive number' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="100.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe your product in detail..."
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="max-h-64 mx-auto rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Upload a product image</p>
                  <label className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                    <Upload size={16} className="mr-2" />
                    <span>Choose File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Seller Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name / Business Name*
                </label>
                <input
                  id="sellerName"
                  type="text"
                  {...register('sellerName', { required: 'Seller name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Local Crafts"
                />
                {errors.sellerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.sellerName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="sellerContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number (optional)
                </label>
                <input
                  id="sellerContact"
                  type="tel"
                  {...register('sellerContact')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              
              <div>
                <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email (optional)
                </label>
                <input
                  id="sellerEmail"
                  type="email"
                  {...register('sellerEmail')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
            >
              {submitting ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
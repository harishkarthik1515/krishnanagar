import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash, ArrowLeft, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerName: string;
  sellerContact?: string;
  sellerEmail?: string;
  sellerId: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const productRef = doc(db, 'products', id);
        const productDoc = await getDoc(productRef);
        
        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data()
          } as Product);
        } else {
          navigate('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'products', id));
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleting(false);
    }
  };

  const canEdit = currentUser && product && currentUser.uid === product.sellerId;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-gray-500 mb-2">Product Not Found</h3>
        <Link 
          to="/products" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to="/products" 
        className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to Products</span>
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-64 bg-gray-100 relative">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={64} className="text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-emerald-600 mb-4">₹{product.price}</p>
            </div>
            
            <div className="bg-emerald-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Sold by</p>
              <p className="text-emerald-800 font-medium">{product.sellerName}</p>
            </div>
          </div>
          
          <div className="my-6 border-t border-b border-gray-100 py-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Contact Seller</h2>
            
            <div className="space-y-3">
              {product.sellerContact && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-emerald-600" />
                  <a 
                    href={`tel:${product.sellerContact}`}
                    className="text-gray-700 hover:text-emerald-600"
                  >
                    {product.sellerContact}
                  </a>
                </div>
              )}
              
              {product.sellerEmail && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-emerald-600" />
                  <a 
                    href={`mailto:${product.sellerEmail}`}
                    className="text-gray-700 hover:text-emerald-600"
                  >
                    {product.sellerEmail}
                  </a>
                </div>
              )}
              
              {!product.sellerContact && !product.sellerEmail && (
                <p className="text-gray-500">Contact information not provided by seller.</p>
              )}
            </div>
          </div>
          
          {canEdit && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash size={16} className="mr-2" />
                <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Mail, Lock, UserPlus, Building, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'entrepreneur';
}

const RegisterPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await registerUser(data.email, data.password, data.role);
      navigate('/profile');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email or sign in.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center">
            <UserPlus size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the Krishna Nagar community</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Account Type
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  value="admin"
                  {...register('role', { required: 'Please select a role' })}
                  className="sr-only"
                />
                <div className={`border ${
                  watch('role') === 'admin' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                } rounded-lg p-4 transition-all hover:border-emerald-200`}>
                  <div className="flex flex-col items-center text-center">
                    <Home size={24} className={`${
                      watch('role') === 'admin' ? 'text-emerald-600' : 'text-gray-400'
                    } mb-2`} />
                    <span className="font-medium text-gray-800">Community Admin</span>
                    <p className="text-xs text-gray-500 mt-1">Post community events</p>
                  </div>
                </div>
                {watch('role') === 'admin' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  value="entrepreneur"
                  {...register('role', { required: 'Please select a role' })}
                  className="sr-only"
                />
                <div className={`border ${
                  watch('role') === 'entrepreneur' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                } rounded-lg p-4 transition-all hover:border-emerald-200`}>
                  <div className="flex flex-col items-center text-center">
                    <Building size={24} className={`${
                      watch('role') === 'entrepreneur' ? 'text-emerald-600' : 'text-gray-400'
                    } mb-2`} />
                    <span className="font-medium text-gray-800">Entrepreneur</span>
                    <p className="text-xs text-gray-500 mt-1">List products & services</p>
                  </div>
                </div>
                {watch('role') === 'entrepreneur' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </label>
            </div>
            
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <UserPlus size={18} className="mr-2" />
              )}
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? {' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
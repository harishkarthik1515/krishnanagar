import { motion } from 'framer-motion';

const WelcomeCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl overflow-hidden shadow-lg relative"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"
      />
      
      <div className="p-6 text-white relative">
        <motion.h2 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-2"
        >
          Welcome to Krishna Nagar
        </motion.h2>
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-4 text-emerald-50"
        >
          Your community hub for events, local businesses, and neighborhood chat.
        </motion.p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4"
          >
            <h3 className="font-semibold text-lg mb-1">Local Events</h3>
            <p className="text-sm text-emerald-50">Stay updated with community gatherings</p>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4"
          >
            <h3 className="font-semibold text-lg mb-1">Local Products</h3>
            <p className="text-sm text-emerald-50">Discover goods from neighborhood businesses</p>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-white p-4"
      >
        <p className="text-center text-emerald-800 font-medium">
          Connect • Explore • Engage
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeCard;
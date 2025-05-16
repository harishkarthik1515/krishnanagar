import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-t-4 border-l-4 border-emerald-600"
          />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-emerald-800 font-medium text-lg"
      >
        Loading Krishna Nagar...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, addDoc, onSnapshot, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Send, Image, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
  imageUrl?: string;
  timestamp: any;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get username from localStorage or prompt
    const storedUserName = localStorage.getItem('chatUserName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setShowNamePrompt(true);
    }

    // Subscribe to messages
    const messagesQuery = query(
      collection(db, 'chat'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage)).reverse();
      
      setMessages(messagesData);
      setLoading(false);
      
      // Scroll to bottom on new messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      
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
    const storageRef = ref(storage, `chat/${fileName}`);
    
    await uploadBytes(storageRef, imageFile);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !imageFile) || !userName.trim()) return;
    
    try {
      setUploading(true);
      
      // Upload image if present
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Add message to Firestore
      await addDoc(collection(db, 'chat'), {
        userName,
        text: newMessage.trim(),
        imageUrl,
        timestamp: new Date().toISOString()
      });
      
      // Reset form
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('chatUserName', userName.trim());
      setShowNamePrompt(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Community Chat</h1>
      
      {/* Chat messages container */}
      <div className="flex-grow bg-white rounded-t-lg shadow-sm border border-gray-100 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-800 font-medium text-sm">
                      {message.userName.substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-baseline">
                      <span className="font-medium text-emerald-800">{message.userName}</span>
                      <span className="ml-2 text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    
                    {message.text && (
                      <p className="mt-1 text-gray-700">{message.text}</p>
                    )}
                    
                    {message.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 inline-block max-w-xs">
                        <img 
                          src={message.imageUrl} 
                          alt="Shared image" 
                          className="max-h-60 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Send size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Messages Yet</h3>
            <p className="text-gray-500">Be the first to start the conversation!</p>
          </div>
        )}
      </div>
      
      {/* Chat input form */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-100 p-4"
      >
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="h-20 rounded-lg border border-gray-200" 
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          >
            <Image size={20} />
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden" 
            />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={uploading || showNamePrompt}
          />
          
          <button
            type="submit"
            disabled={uploading || showNamePrompt || (!newMessage.trim() && !imageFile)}
            className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
      
      {/* Name prompt modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Enter Your Name</h2>
              <p className="text-gray-600 mb-4">
                Please enter your name to join the community chat. This will be visible to others.
              </p>
              
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                autoFocus
              />
              
              <button
                onClick={saveUserName}
                disabled={!userName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Join Chat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
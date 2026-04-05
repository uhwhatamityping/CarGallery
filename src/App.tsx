import React, { useState, useRef, useEffect } from 'react';
import { Menu, Heart, Plus, X, Upload, Loader2, User, Trash2, LogOut } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, loginWithGoogle, logout } from './firebase';

type Category = 'Sports' | 'SUV' | 'Classic';

interface Car {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  liked: boolean;
  ownerId: string;
}

export default function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Load saved cars from Firebase
  useEffect(() => {
    const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedCars: Car[] = [];
      snapshot.forEach((doc) => {
        loadedCars.push({ id: doc.id, ...doc.data() } as Car);
      });
      setCars(loadedCars);
      setIsLoaded(true);
    }, (error) => {
      console.error("Error fetching cars:", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredCars = filter === 'All' ? cars : cars.filter(c => c.category === filter);

  const toggleLike = async (car: Car) => {
    if (!user || user.uid !== car.ownerId) return; // Only owner can like for now based on rules
    try {
      await updateDoc(doc(db, 'cars', car.id), {
        liked: !car.liked
      });
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  const deleteCar = async (car: Car) => {
    if (!user || user.uid !== car.ownerId) return;
    try {
      await deleteDoc(doc(db, 'cars', car.id));
    } catch (err) {
      console.error('Failed to delete car:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="w-8"></div> {/* Spacer for centering */}
        <h1 className="text-xl font-semibold tracking-tight">Car Gallery</h1>
        {user ? (
          <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-sm text-gray-600">
            <img src={user.photoURL || ''} alt="Profile" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={loginWithGoogle} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-blue-600">
            <User className="w-5 h-5" />
            Login
          </button>
        )}
      </header>

      {/* Filter Bar */}
      <div className="px-4 py-6 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2 min-w-max max-w-7xl mx-auto justify-center sm:justify-start">
          {['All', 'Sports', 'SUV', 'Classic'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as Category | 'All')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <main className="px-4 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCars.map(car => (
            <div key={car.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={car.imageUrl} 
                  alt={car.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => toggleLike(car)}
                  className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`w-5 h-5 ${car.liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                {/* Delete Button */}
                {user && user.uid === car.ownerId && (
                  <button 
                    onClick={() => deleteCar(car)}
                    className="absolute top-3 left-3 p-2 bg-white/70 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors group/delete"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600 group-hover/delete:text-red-500" />
                  </button>
                )}
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{car.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{car.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredCars.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No cars found in this category.
          </div>
        )}
      </main>

      {/* FAB */}
      {user && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)} 
          user={user}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, user }: { onClose: () => void, user: any }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Sports');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageFile) {
      setError('Please provide a name and an image.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Create an image element for the models to read
      const img = new Image();
      img.src = previewUrl!;
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 2. Load and run NSFWJS for inappropriate content
      const nsfwModel = await nsfwjs.load();
      const nsfwPredictions = await nsfwModel.classify(img);
      
      // If Porn, Hentai, or Sexy is detected with high probability, block it
      const isUnsafe = nsfwPredictions.some(p => 
        ['Porn', 'Hentai', 'Sexy'].includes(p.className) && p.probability > 0.6
      );

      if (isUnsafe) {
        setError('Inappropriate content detected. Upload blocked.');
        setIsUploading(false);
        return;
      }

      // Compress image to ensure it's under 1MB for Firestore
      const base64Data = await compressImage(imageFile);

      // 3. Add to gallery
      await addDoc(collection(db, 'cars'), {
        name,
        category,
        imageUrl: base64Data,
        liked: false,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Add New Car</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car Name / Model</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Tesla Model S"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Sports">Sports</option>
              <option value="SUV">SUV</option>
              <option value="Classic">Classic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                previewUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="py-6 flex flex-col items-center text-gray-500">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <span className="text-sm">Click to upload image</span>
                  <span className="text-xs mt-1 text-gray-400">JPG, PNG, WEBP</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isUploading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                'Add to Gallery'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

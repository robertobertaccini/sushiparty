import { useState } from 'react';
import { X } from 'lucide-react';

const images = [
  "100-2000x1331.jpg",
  "100-2000x2666.jpg",
  "100-1-2000x1500.jpg",
  "2016-03-08-21-2000x1123.jpg",
  "cimg0027-2-2000x2666.jpg",
  "2015-12-07-22-2000x3560.jpg",
  "cimg0041-2000x1500.jpg",
  "12923109-10153511328643263-5362409893552790794-n-2000x2666-800x1066.jpg",
  "wp-20160324-2000x3560.jpg",
  "img-20150511-wa0001-2000x1500-800x600.jpg",
  "img-20160417-wa0012-2000x1500.jpg",
  "altau8fjuixdlbp1tc2qpeccfw6i61lc5kgvekbaeowguho-2000x2666.jpg",
  "100-3-2000x1498.jpg",
  "100-4-2000x1498.jpg",
  "100-5-2000x1498.jpg",
  "100-6-2000x1498.jpg",
  "cimg2164-2000x1500.jpg",
  "img-20160417-wa0007-2000x2666.jpg",
  "wp-20160312-2000x3560.jpg",
  "dscn2161-2000x1500.jpg"
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the beauty of our sushi creations. A feast for your eyes and taste buds!
          </p>
        </div>
        
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedImage(`/gallery/${img}`)}
            >
              <img 
                src={`/gallery/${img}`} 
                alt={`Gallery photo ${idx + 1}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={32} />
            </button>
            <img 
              src={selectedImage} 
              alt="Selected gallery image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

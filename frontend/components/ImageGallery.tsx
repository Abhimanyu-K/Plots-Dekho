'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const hasImages = images && images.length > 0;
  const displayImages = hasImages ? images : ['/placeholder-property.jpg'];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-white shadow-lg">
        {/* Main Image */}
        <div className="relative aspect-video bg-gray-200">
          <img
            src={displayImages[selectedImage]}
            alt={`Property image ${selectedImage + 1}`}
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => setShowFullscreen(true)}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-property.jpg';
            }}
          />

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
              >
                <svg
                  className="h-6 w-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
              >
                <svg
                  className="h-6 w-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
              {selectedImage + 1} / {displayImages.length}
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="absolute bottom-4 left-4 rounded-md bg-black/60 p-2 text-white hover:bg-black/80"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-4">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-20 w-28 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-property.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={displayImages[selectedImage]}
              alt={`Property image ${selectedImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-property.jpg';
              }}
            />

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
                >
                  <svg
                    className="h-8 w-8 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
                >
                  <svg
                    className="h-8 w-8 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-white">
                  {selectedImage + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

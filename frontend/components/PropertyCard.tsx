'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { favoritesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyCardProps {
  property: any;
  showFavorite?: boolean;
}

export default function PropertyCard({ property, showFavorite = true }: PropertyCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(property.id);
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(property.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = property.images?.[0]?.imageUrl || '/placeholder-property.jpg';

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-property.jpg';
            }}
          />

          {/* Favorite Button */}
          {showFavorite && isAuthenticated && (
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 disabled:opacity-50"
            >
              <svg
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : 'fill-none'} stroke-current text-red-500`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          )}

          {/* Listing Type Badge */}
          <div className="absolute left-2 top-2">
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${
                property.listingType === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
              }`}
            >
              For {property.listingType === 'SALE' ? 'Sale' : 'Rent'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{property.title}</h3>

          <p className="mt-1 text-sm text-gray-600">
            {property.city}, {property.state}
          </p>

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {property.bedrooms} BHK
              </span>
            )}

            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {property.bathrooms} Bath
              </span>
            )}

            {property.areaSqft && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                {Number(property.areaSqft).toLocaleString()} sqft
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(Number(property.price))}
              </p>
              {property.listingType === 'RENT' && (
                <p className="text-xs text-gray-500">per month</p>
              )}
            </div>

            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

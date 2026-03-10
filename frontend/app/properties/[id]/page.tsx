'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertiesAPI, favoritesAPI, leadsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import ImageGallery from '@/components/ImageGallery';
import ContactOwnerModal from '@/components/ContactOwnerModal';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProperty();
      if (isAuthenticated) {
        checkFavorite();
      }
    }
  }, [params.id, isAuthenticated]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getById(params.id as string);
      setProperty(response.data);
    } catch (error) {
      console.error('Failed to fetch property:', error);
      router.push('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesAPI.check(params.id as string);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(params.id as string);
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(params.id as string);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const images = property.images?.map((img: any) => img.imageUrl) || [];
  const amenities = property.amenities?.map((a: any) => a.amenity.name) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/properties" className="text-blue-600 hover:underline">
                Properties
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 truncate">{property.title}</li>
          </ol>
        </nav>

        {/* Image Gallery */}
        <ImageGallery images={images} />

        {/* Property Info */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-md px-3 py-1 text-sm font-semibold text-white ${
                        property.listingType === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                    >
                      For {property.listingType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                      {property.propertyType}
                    </span>
                  </div>

                  <h1 className="mt-3 text-3xl font-bold text-gray-900">{property.title}</h1>

                  <p className="mt-2 flex items-center text-gray-600">
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {property.address && `${property.address}, `}
                    {property.city}, {property.state} - {property.pincode}
                  </p>
                </div>

                <button
                  onClick={toggleFavorite}
                  className="rounded-full bg-white p-3 shadow-md hover:bg-gray-50"
                >
                  <svg
                    className={`h-6 w-6 ${isFavorite ? 'fill-red-500' : 'fill-none'} stroke-current text-red-500`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatCurrency(Number(property.price))}
                  </span>
                  {property.listingType === 'RENT' && (
                    <span className="text-gray-600">per month</span>
                  )}
                </div>
                {property.deposit && (
                  <p className="mt-1 text-sm text-gray-600">
                    Deposit: {formatCurrency(Number(property.deposit))}
                  </p>
                )}
              </div>

              {/* Property Details Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                {property.areaSqft && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Number(property.areaSqft).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                )}
                {property.furnishing && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {property.furnishing.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">Furnishing</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-bold text-gray-900">Description</h2>
                <p className="mt-4 whitespace-pre-line text-gray-700">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 capitalize">{amenity.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-gray-600">Property ID:</span>
                  <p className="font-medium text-gray-900">{property.id.slice(0, 8)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Listed On:</span>
                  <p className="font-medium text-gray-900">{formatDate(property.createdAt)}</p>
                </div>
                {property.availableFrom && (
                  <div>
                    <span className="text-sm text-gray-600">Available From:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(property.availableFrom)}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Views:</span>
                  <p className="font-medium text-gray-900">{property.viewsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900">Contact Owner</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {property.user?.name || 'Property Owner'}
                    </p>
                    <p className="text-sm text-gray-600">Property Owner</p>
                  </div>
                </div>

                <button
                  onClick={handleContactOwner}
                  className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Send Inquiry
                </button>

                {property.user?.phone && (
                  <a
                    href={`tel:${property.user.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call Now
                  </a>
                )}
              </div>

              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Always verify property details before making any payment.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900">Property Stats</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{property.viewsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-semibold text-gray-900">
                    {property._count?.favorites || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inquiries</span>
                  <span className="font-semibold text-gray-900">
                    {property._count?.leads || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactOwnerModal
          propertyId={property.id}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}

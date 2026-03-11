'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function MyPropertiesPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
        router.push('/properties');
      } else {
        fetchMyProperties();
      }
    }
  }, [isAuthenticated, authLoading, user, page]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getMyProperties({ page, limit: 10 });
      setProperties(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertiesAPI.delete(id);
      fetchMyProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-white shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="mt-2 text-gray-600">
              Manage your {meta?.total || 0} property listings
            </p>
          </div>
          <Link
            href="/properties/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add New Property
          </Link>
        </div>

        {/* Properties List */}
        {properties.length > 0 ? (
          <>
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="h-48 w-full sm:h-auto sm:w-64">
                      <img
                        src={property.images?.[0]?.imageUrl || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-property.jpg';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${
                                  property.listingType === 'SALE'
                                    ? 'bg-green-600'
                                    : 'bg-blue-600'
                                }`}
                              >
                                For {property.listingType === 'SALE' ? 'Sale' : 'Rent'}
                              </span>
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                  property.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {property.status}
                              </span>
                            </div>

                            <h3 className="mt-2 text-lg font-semibold text-gray-900">
                              {property.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                              {property.city}, {property.state}
                            </p>

                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                              {property.bedrooms && (
                                <span>{property.bedrooms} BHK</span>
                              )}
                              {property.areaSqft && (
                                <span>{Number(property.areaSqft).toLocaleString()} sqft</span>
                              )}
                            </div>

                            <p className="mt-2 text-xl font-bold text-blue-600">
                              {formatCurrency(Number(property.price))}
                              {property.listingType === 'RENT' && (
                                <span className="text-sm font-normal text-gray-600">
                                  {' '}
                                  / month
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 flex gap-6 border-t pt-4 text-sm">
                          <div>
                            <span className="text-gray-600">Views:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {property.viewsCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Favorites:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {property._count?.favorites || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Inquiries:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {property._count?.leads || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Link>
                        <Link
                          href={`/properties/${property.id}/edit`}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {[...Array(meta.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        meta.page === i + 1
                          ? 'z-10 bg-blue-600 text-white'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No properties yet</h3>
            <p className="mt-2 text-gray-600">
              Get started by adding your first property listing.
            </p>
            <Link
              href="/properties/new"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + Add Property
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

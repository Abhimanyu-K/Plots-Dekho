'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { leadsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function LeadsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        // Set default tab based on user role
        if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
          setActiveTab('received');
        }
        fetchLeads();
      }
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [activeTab, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response =
        activeTab === 'sent'
          ? await leadsAPI.getSent({ page, limit: 10 })
          : await leadsAPI.getReceived({ page, limit: 10 });
      setLeads(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await leadsAPI.updateStatus(leadId, status);
      fetchLeads();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update lead status');
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }

    try {
      await leadsAPI.delete(leadId);
      fetchLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete inquiry');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'INTERESTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-white shadow"></div>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'OWNER' ? 'Inquiries' : 'My Inquiries'}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your property inquiries and communications
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('sent');
                setPage(1);
              }}
              className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === 'sent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Sent Inquiries
            </button>
            {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => {
                  setActiveTab('received');
                  setPage(1);
                }}
                className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
                  activeTab === 'received'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Received Inquiries
              </button>
            )}
          </nav>
        </div>

        {/* Leads List */}
        {leads.length > 0 ? (
          <>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-lg bg-white p-6 shadow">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Property Image */}
                    {lead.property && (
                      <div className="h-32 w-full sm:w-48">
                        <img
                          src={lead.property.images?.[0]?.imageUrl || '/placeholder-property.jpg'}
                          alt={lead.property.title}
                          className="h-full w-full rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-property.jpg';
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {lead.property && (
                            <Link
                              href={`/properties/${lead.property.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {lead.property.title}
                            </Link>
                          )}

                          <div className="mt-2 flex items-center gap-3">
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(lead.createdAt)}
                            </span>
                          </div>

                          {activeTab === 'received' && lead.seeker && (
                            <div className="mt-3 text-sm">
                              <p className="font-medium text-gray-900">
                                From: {lead.seeker.name || lead.seeker.email}
                              </p>
                              {lead.seeker.phone && (
                                <p className="text-gray-600">Phone: {lead.seeker.phone}</p>
                              )}
                              {lead.seeker.email && (
                                <p className="text-gray-600">Email: {lead.seeker.email}</p>
                              )}
                            </div>
                          )}

                          {activeTab === 'sent' && lead.owner && (
                            <div className="mt-3 text-sm">
                              <p className="font-medium text-gray-900">
                                To: {lead.owner.name || 'Property Owner'}
                              </p>
                            </div>
                          )}

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Message:</p>
                            <p className="mt-1 text-sm text-gray-600">{lead.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        {activeTab === 'received' && (
                          <>
                            {lead.status === 'NEW' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                              >
                                Mark as Contacted
                              </button>
                            )}
                            {lead.status === 'CONTACTED' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(lead.id, 'INTERESTED')}
                                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                  Mark as Interested
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(lead.id, 'REJECTED')}
                                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Rejected
                                </button>
                              </>
                            )}
                            {lead.seeker?.phone && (
                              <a
                                href={`tel:${lead.seeker.phone}`}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Call
                              </a>
                            )}
                            {lead.seeker?.email && (
                              <a
                                href={`mailto:${lead.seeker.email}`}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Email
                              </a>
                            )}
                          </>
                        )}

                        {activeTab === 'sent' && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab === 'sent' ? 'sent' : 'received'} inquiries
            </h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'sent'
                ? 'Browse properties and send inquiries to property owners.'
                : 'You will see inquiries from interested buyers here.'}
            </p>
            {activeTab === 'sent' && (
              <a
                href="/properties"
                className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Browse Properties
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

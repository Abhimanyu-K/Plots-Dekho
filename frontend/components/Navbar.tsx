'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Plots Dekho</span>
            </Link>

            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/properties"
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/properties')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Properties
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/favorites"
                    className={`px-3 py-2 text-sm font-medium ${
                      isActive('/favorites')
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Favorites
                  </Link>

                  {user?.role === 'OWNER' && (
                    <Link
                      href="/my-properties"
                      className={`px-3 py-2 text-sm font-medium ${
                        isActive('/my-properties')
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      My Properties
                    </Link>
                  )}

                  <Link
                    href="/leads"
                    className={`px-3 py-2 text-sm font-medium ${
                      isActive('/leads')
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {user?.role === 'OWNER' ? 'Inquiries' : 'My Inquiries'}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Hi, {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

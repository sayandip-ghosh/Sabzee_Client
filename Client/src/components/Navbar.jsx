import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaShoppingCart } from 'react-icons/fa';
import TranslateText from './TranslateText';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">
                <TranslateText>Sabzee</TranslateText>
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  <TranslateText>Home</TranslateText>
                </Link>
                <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  <TranslateText>Products</TranslateText>
                </Link>
                {isAuthenticated && user?.role === 'farmer' && (
                  <>
                    <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      <TranslateText>Dashboard</TranslateText>
                    </Link>
                    <Link to="/crop-scan" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      <TranslateText>Crop Scan</TranslateText>
                    </Link>
                    <Link to="/yield-prediction" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      <TranslateText>Yield Prediction</TranslateText>
                    </Link>
                    <Link to="/forum" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      <TranslateText>Forum</TranslateText>
                    </Link>
                  </>
                )}
                <LanguageSelector />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <span className="mr-4">
                    <TranslateText>Hi</TranslateText>, {user?.name}
                  </span>
                  {user?.role === 'farmer' && (
                    <Link to="/add-product" className="mr-4 px-3 py-1 bg-white text-green-600 rounded-md text-sm font-medium hover:bg-gray-100">
                      <TranslateText>Add Product</TranslateText>
                    </Link>
                  )}
                  {user?.role === 'consumer' && (
                    <Link to="/cart" className="mr-4 relative" title="View Cart">
                      <FaShoppingCart className="text-white text-xl" />
                    </Link>
                  )}
                  <Link to="/profile" className="mr-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                    <TranslateText>Profile</TranslateText>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-1 border border-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    <TranslateText>Logout</TranslateText>
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <Link to="/login" className="px-3 py-1 border border-white rounded-md text-sm font-medium hover:bg-green-700 mr-3">
                    <TranslateText>Login</TranslateText>
                  </Link>
                  <Link to="/register" className="px-3 py-1 bg-white text-green-600 rounded-md text-sm font-medium hover:bg-gray-100">
                    <TranslateText>Register</TranslateText>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
              <TranslateText>Home</TranslateText>
            </Link>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
              <TranslateText>Products</TranslateText>
            </Link>
            {isAuthenticated && user?.role === 'farmer' && (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Dashboard</TranslateText>
                </Link>
                <Link to="/crop-scan" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Crop Scan</TranslateText>
                </Link>
                <Link to="/yield-prediction" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Yield Prediction</TranslateText>
                </Link>
                <Link to="/forum" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Forum</TranslateText>
                </Link>
              </>
            )}
            <div className="px-3 py-2">
              <LanguageSelector />
            </div>
          </div>
          <div className="pt-4 pb-3 border-t border-green-700">
            {isAuthenticated ? (
              <div className="flex flex-col px-2">
                <span className="block px-3 py-2 text-base font-medium">
                  <TranslateText>Hi</TranslateText>, {user?.name}
                </span>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Profile</TranslateText>
                </Link>
                {user?.role === 'farmer' && (
                  <Link to="/add-product" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                    <TranslateText>Add Product</TranslateText>
                  </Link>
                )}
                {user?.role === 'consumer' && (
                  <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                    <TranslateText>My Cart</TranslateText>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="mt-1 block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                >
                  <TranslateText>Logout</TranslateText>
                </button>
              </div>
            ) : (
              <div className="flex flex-col px-2">
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Login</TranslateText>
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <TranslateText>Register</TranslateText>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
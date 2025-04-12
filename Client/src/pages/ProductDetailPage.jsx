import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { cartApi, productApi } from '../services/api';
import TranslateText from '../components/TranslateText';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(response.data);
        // Set user's existing rating if they've rated before
        if (response.data.ratings && isAuthenticated) {
          const existingRating = response.data.ratings.find(r => r.user === user.id);
          if (existingRating) {
            setUserRating(existingRating.rating);
            setUserReview(existingRating.review);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated, user]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }

    setAddingToCart(true);
    setCartSuccess(false);

    try {
      await cartApi.addToCart(productId, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }

    setSubmittingRating(true);
    try {
      const updatedProduct = await productApi.rateProduct(productId, userRating, userReview);
      setProduct(updatedProduct);
      setRatingSuccess(true);
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">
          <TranslateText>Loading product...</TranslateText>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
          <p className="text-red-700">
            <TranslateText>{error}</TranslateText>
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <TranslateText>Go to Home</TranslateText>
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
          <p className="text-red-700">
            <TranslateText>Product not found</TranslateText>
          </p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <TranslateText>Browse Products</TranslateText>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/products" className="text-green-600 hover:text-green-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <TranslateText>Back to Products</TranslateText>
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product images */}
          <div className="lg:max-w-lg lg:self-start">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex].url}
                  alt={product.name}
                  className="w-full h-96 object-cover object-center"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <TranslateText>No image available</TranslateText>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-md overflow-hidden ${
                      currentImageIndex === index ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                <TranslateText>{product.name}</TranslateText>
              </h1>
              <span className={`px-2 pt-2 text-xs font-semibold rounded-full ${
                product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.status === 'available' ? (
                  <TranslateText>In Stock</TranslateText>
                ) : (
                  <TranslateText>Sold Out</TranslateText>
                )}
              </span>
            </div>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">
                <TranslateText>Price:</TranslateText> ₹{product.price} <TranslateText>per</TranslateText> {product.unit}
              </p>
            </div>

            {/* Product metadata */}
            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`h-5 w-5 ${
                        index < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-500">
                  {product.averageRating ? `${product.averageRating.toFixed(1)} out of 5 stars` : 'Not yet rated'}
                  {product.ratings && product.ratings.length > 0 && ` (${product.ratings.length} reviews)`}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  <TranslateText>Category</TranslateText>
                </h3>
                <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  <TranslateText>Available Quantity</TranslateText>
                </h3>
                <p className="text-sm text-gray-500">{product.quantity} {product.unit}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  <TranslateText>Harvest Date</TranslateText>
                </h3>
                <p className="text-sm text-gray-500">{formatDate(product.harvestDate)}</p>
              </div>
              {product.organic && (
                <div className="flex items-center mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-green-700 font-medium">
                    <TranslateText>Organic Product</TranslateText>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">
                <TranslateText>Description</TranslateText>
              </h3>
              <div className="mt-2 prose prose-sm text-gray-500">
                <p>
                  <TranslateText>{product.description}</TranslateText>
                </p>
              </div>
            </div>

            {/* Certifications */}
            {product.certifications && product.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  <TranslateText>Certifications</TranslateText>
                </h3>
                <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                  {product.certifications.map((cert, index) => (
                    <li key={index} className="px-4 py-3">
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-500">#{cert.certificationNumber}</p>
                      {cert.issuedDate && cert.expiryDate && (
                        <p className="text-xs text-gray-500">
                          Valid: {formatDate(cert.issuedDate)} to {formatDate(cert.expiryDate)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Farmer information */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900">
                <TranslateText>Farmer Information</TranslateText>
              </h3>
              <div className="mt-4 flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {product.farmer.profileImage ? (
                    <img
                      src={product.farmer.profileImage}
                      alt={product.farmer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-green-100 text-green-600">
                      <span className="text-xl font-bold">{product.farmer?.name?.charAt(0)?.toUpperCase() || 'F'}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">{product.farmer?.name || 'Farmer'}</h4>
                  {product.farmer?.farmDetails && (
                    <p className="text-sm text-gray-500">{product.farmer.farmDetails.farmName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Add to cart section */}
            {product.status === 'available' && user?.role === 'consumer' && (
              <div className="mt-8">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900 mr-4">
                    <TranslateText>Quantity</TranslateText>
                  </h3>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="p-2 text-gray-500 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border-x border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="p-2 text-gray-500 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      addingToCart ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {addingToCart ? (
                      <TranslateText>Adding...</TranslateText>
                    ) : (
                      <TranslateText>Add to Cart</TranslateText>
                    )}
                  </button>
                </div>

                {cartSuccess && (
                  <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <TranslateText>Product added to cart successfully</TranslateText>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="mt-4 text-sm text-gray-500">
                    <TranslateText>Please</TranslateText> <Link to="/login" className="text-green-600 font-medium">
                      <TranslateText>login</TranslateText>
                    </Link> <TranslateText>to add items to your cart.</TranslateText>
                  </p>
                )}
              </div>
            )}

            {/* Add Rating Section */}
            {user?.role === 'consumer' && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <TranslateText>Rate this Product</TranslateText>
                </h3>
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslateText>Your Rating</TranslateText>
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`h-8 w-8 ${
                              star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslateText>Your Review</TranslateText>
                    </label>
                    <textarea
                      id="review"
                      rows={4}
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Write your review here..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingRating || !userRating}
                    className={`w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      submittingRating || !userRating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submittingRating ? (
                      <TranslateText>Submitting...</TranslateText>
                    ) : (
                      <TranslateText>Submit Review</TranslateText>
                    )}
                  </button>
                </form>

                {ratingSuccess && (
                  <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <TranslateText>Review submitted successfully!</TranslateText>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Display Reviews Section */}
            {product?.ratings && product.ratings.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <TranslateText>Customer Reviews</TranslateText>
                </h3>
                <div className="space-y-6">
                  {product.ratings.map((rating, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-5 w-5 ${
                                star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(rating.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{rating.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { cartApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CartPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  // Form for shipping details
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    paymentMethod: 'cash-on-delivery',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cartApi.getCart();
        setCart(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load your cart. Please try again.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    } else {
      // Redirect non-authenticated users to login
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [isAuthenticated, navigate]);

  // Redirect non-consumer users away from this page
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'consumer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Handle quantity update for cart item
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (updating) return;

    try {
      setUpdating(true);
      const updatedCart = await cartApi.updateCartItem(itemId, newQuantity);
      setCart(updatedCart);
      setUpdating(false);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
      setUpdating(false);
    }
  };

  // Handle removing item from cart
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    if (updating) return;

    try {
      setUpdating(true);
      const updatedCart = await cartApi.removeCartItem(itemId);
      setCart(updatedCart);
      setUpdating(false);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
      setUpdating(false);
    }
  };

  // Handle input change for shipping form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate checkout form
  const validateForm = () => {
    const errors = {};
    
    if (!shippingDetails.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!shippingDetails.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!shippingDetails.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingDetails.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!shippingDetails.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    if (!shippingDetails.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(shippingDetails.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle checkout process
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (checkingOut) return;
    
    try {
      setCheckingOut(true);
      const result = await cartApi.checkout(shippingDetails);
      
      // Redirect to order confirmation
      navigate(`/orders/${result.order._id}`, { 
        state: { 
          success: true, 
          message: 'Your order has been placed successfully!' 
        } 
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Display error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  // Display empty cart message
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="text-green-600 hover:text-green-800 flex items-center mb-6">
          <FaArrowLeft className="mr-2" /> Continue Shopping
        </Link>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="text-green-600 hover:text-green-800 flex items-center mb-6">
        <FaArrowLeft className="mr-2" /> Continue Shopping
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cart header */}
        <div className="hidden md:flex bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-500">PRODUCT</h3>
          </div>
          <div className="w-32 text-center">
            <h3 className="text-sm font-medium text-gray-500">QUANTITY</h3>
          </div>
          <div className="w-32 text-right mr-20 pr-5">
            <h3 className="text-sm font-medium text-gray-500">PRICE</h3>
          </div>
        </div>
        
        {/* Cart items */}
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div key={item._id} className="px-6 py-4 flex flex-col md:flex-row md:items-center">
              {/* Product info */}
              <div className="flex-grow flex items-center">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>
                        <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                      </h3>
                      <p className="ml-4 md:hidden">₹{item.product.price} / {item.product.unit}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Farmer: {item.product.farmer.name}</p>
                    {item.product.organic && (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Organic
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quantity controls */}
              <div className="mt-4 md:mt-0 w-32 flex justify-center">
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updating}
                    className={`p-2 text-gray-500 ${
                      item.quantity <= 1 || updating ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'
                    }`}
                  >
                    <FaMinus className="h-3 w-3" />
                  </button>
                  <div className="w-10 text-center flex items-center justify-center border-x border-gray-300">
                    {item.quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    disabled={updating}
                    className={`p-2 text-gray-500 ${
                      updating ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'
                    }`}
                  >
                    <FaPlus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              {/* Price */}
              <div className="hidden md:block w-32 text-right">
                <p className="text-base text-gray-900">₹{item.product.price} / {item.product.unit}</p>
                <p className="text-sm text-gray-500">Total: ₹{item.product.price * item.quantity}</p>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end w-20">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item._id)}
                  disabled={updating}
                  className={`text-red-500 hover:text-red-700 ${
                    updating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart summary */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>₹{cart.total}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes will be calculated at checkout.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCheckoutForm(true)}
              className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      
      {/* Checkout form modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Checkout</h3>
                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingDetails.fullName}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                            formErrors.fullName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                          }`}
                        />
                        {formErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows="3"
                          value={shippingDetails.address}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                            formErrors.address 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                          }`}
                        ></textarea>
                        {formErrors.address && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shippingDetails.city}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                              formErrors.city 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                            }`}
                          />
                          {formErrors.city && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={shippingDetails.state}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                              formErrors.state 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                            }`}
                          />
                          {formErrors.state && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                            Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={shippingDetails.postalCode}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                              formErrors.postalCode 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                            }`}
                          />
                          {formErrors.postalCode && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={shippingDetails.phoneNumber}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                              formErrors.phoneNumber 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                            }`}
                          />
                          {formErrors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <input
                              id="cash-on-delivery"
                              name="paymentMethod"
                              type="radio"
                              value="cash-on-delivery"
                              checked={shippingDetails.paymentMethod === 'cash-on-delivery'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor="cash-on-delivery" className="ml-3 block text-sm font-medium text-gray-700">
                              Cash on Delivery
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Order Total:</p>
                          <p>₹{cart.total}</p>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    checkingOut ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {checkingOut ? 'Processing...' : 'Place Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 
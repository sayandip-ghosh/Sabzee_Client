import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaHome, FaClipboardList } from 'react-icons/fa';
import { orderApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated and is a consumer
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'consumer') {
      navigate('/');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(orderId);
        setOrder(data.order);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details. Please check your orders page.');
        setLoading(false);
      }
    };
    
    if (isAuthenticated && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/" className="text-green-600 hover:text-green-800 font-medium">Return to Home</Link>
      </div>
    );
  }
  
  // If no order found
  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaHome className="mr-2" /> Go to Home
            </Link>
            <Link 
              to="/orders" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaClipboardList className="mr-2" /> View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Success message */}
      {location.state?.success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-green-700">{location.state.message || 'Order placed successfully!'}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Order Confirmation</h1>
        </div>
        
        <div className="px-6 py-4">
          {/* Order summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{order.paymentMethod.replace(/-/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipping Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{order.shippingDetails.fullName}</p>
              <p className="text-gray-600">{order.shippingDetails.address}</p>
              <p className="text-gray-600">
                {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}
              </p>
              <p className="text-gray-600">Phone: {order.shippingDetails.phoneNumber}</p>
            </div>
          </div>
          
          {/* Order items */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-5 gap-4 bg-gray-100 p-4 font-medium text-gray-700">
                <div className="col-span-2">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Total</div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item._id} className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="col-span-2 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Farmer: {item.product.farmer.name}</p>
                      </div>
                    </div>
                    <div className="text-center flex md:block items-center justify-between">
                      <span className="md:hidden font-medium text-gray-700">Price:</span>
                      <span>₹{item.price} / {item.product.unit}</span>
                    </div>
                    <div className="text-center flex md:block items-center justify-between">
                      <span className="md:hidden font-medium text-gray-700">Quantity:</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="text-center flex md:block items-center justify-between">
                      <span className="md:hidden font-medium text-gray-700">Total:</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order total */}
              <div className="border-t border-gray-200 p-4 flex flex-col items-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Link 
              to="/" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaHome className="mr-2" /> Continue Shopping
            </Link>
            <Link 
              to="/orders" 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaClipboardList className="mr-2" /> View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 
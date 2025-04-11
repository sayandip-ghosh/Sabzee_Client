import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { productApi, farmerApi, orderApi } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Chart colors
const COLORS = ['#10B981', '#FBBF24', '#60A5FA', '#EF4444', '#8B5CF6', '#EC4899'];

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New state variables for enhanced analytics
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const [ordersFilter, setOrdersFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch farmer's products
        const productsResponse = await productApi.getProducts({ farmer: user._id });
        let productsData = Array.isArray(productsResponse) ? productsResponse : productsResponse.products || [];
        setProducts(productsData);

        // Fetch all orders
        const ordersResponse = await orderApi.getOrders();
        const allOrders = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.orders || [];
        
        // Filter orders to find those that contain items from this farmer
        const filteredOrders = allOrders.filter(order => {
          // Get items that belong to this farmer
          const farmerItems = order.items.filter(item => {
            // Check if the item's product farmer matches current user
            return item.product?.farmer?._id === user._id;
          });
          
          // Only include orders that have items from this farmer
          if (farmerItems.length > 0) {
            // Add farmerItems to the order object for easy access
            order.farmerItems = farmerItems;
            return true;
          }
          return false;
        });

        setFarmerOrders(filteredOrders);

        // Calculate analytics
        const analyticsData = {
          totalSales: 0,
          totalOrders: filteredOrders.length,
          pendingOrders: 0,
          completedOrders: 0,
          processingOrders: 0,
          cancelledOrders: 0
        };

        // Process orders for analytics
        filteredOrders.forEach(order => {
          // Calculate total sales from the farmer's items
          const orderTotal = order.farmerItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );
          analyticsData.totalSales += orderTotal;

          // Count orders by status
          switch(order.status) {
            case 'pending':
              analyticsData.pendingOrders++;
              break;
            case 'completed':
              analyticsData.completedOrders++;
              break;
            case 'processing':
              analyticsData.processingOrders++;
              break;
            case 'cancelled':
              analyticsData.cancelledOrders++;
              break;
            default:
              break;
          }
        });

        setAnalytics(analyticsData);
        
        // Process analytics data for charts
        processAnalyticsData(filteredOrders, productsData);
        
      } catch (error) {
        console.error('Error fetching farmer data:', error);
        setError('Failed to load dashboard data. ' + error.message);
        setProducts([]);
        setFarmerOrders([]);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'farmer') {
      fetchData();
    }
  }, [user]);
  
  // Function to process orders data for analytics
  const processAnalyticsData = (orders, products) => {
    // Create order status distribution data
    const statusCounts = orders.reduce((counts, order) => {
      const status = order.status || 'pending';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    
    const statusData = Object.keys(statusCounts).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status]
    }));
    
    setOrderStatusData(statusData);
    
    // Create top products data
    const productSales = {};
    orders.forEach(order => {
      order.farmerItems.forEach(item => {
        const productId = item.product._id || item.product;
        if (products.some(p => p._id === productId)) {
          if (!productSales[productId]) {
            const matchingProduct = products.find(p => p._id === productId);
            productSales[productId] = {
              id: productId,
              name: matchingProduct?.name || item.name || 'Unknown Product',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });
    
    // Sort by revenue and take top 5
    const topProductsArray = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
      
    setTopProducts(topProductsArray);
    
    // Create monthly sales data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize with zero values for all months
    const monthlySalesData = months.map(month => ({
      name: month,
      sales: 0,
      orders: 0
    }));
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      // Only include orders from current year
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        
        // Calculate total for this farmer's products in the order
        const orderTotal = order.farmerItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        
        monthlySalesData[monthIndex].sales += orderTotal;
        monthlySalesData[monthIndex].orders += 1;
      }
    });
    
    setMonthlySales(monthlySalesData);
    
    // Also update the analytics state with the calculated total sales
    setAnalytics(prev => ({
      ...prev,
      totalSales: prev.totalSales.toFixed(2)
    }));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null); // Clear any existing errors
      await productApi.deleteProduct(productId);
      
      // Update the products list after successful deletion
      setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Product deleted successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Failed to delete product. Please try again.');
      
      // Scroll to error message if it's not visible
      const errorElement = document.querySelector('.bg-red-50');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm text-gray-600">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return `₹${Number(value).toFixed(2)}`;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You need to be logged in as a farmer to access this page.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-gray-900">Farmer Dashboard</h1>
            <p className="mt-1 text-lg text-gray-500">
              Welcome back, {user.name}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              to="/add-product"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add New Product
            </Link>
            <Link
              to="/crop-scan"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Scan Crop Disease
            </Link>
            <Link
              to="/yield-prediction"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Predict Yield
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Sales Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                        <dd className="text-lg font-medium text-gray-900">₹{analytics?.totalSales || '0.00'}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics?.totalOrders || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics?.pendingOrders || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Orders Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Orders</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics?.completedOrders || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Trends Chart */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales Trends</h2>
              <div className="flex justify-end mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setDateRange('month')}
                    className={`py-2 px-4 text-sm font-medium rounded-l-lg border ${
                      dateRange === 'month'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateRange('quarter')}
                    className={`py-2 px-4 text-sm font-medium border-t border-b ${
                      dateRange === 'quarter'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    This Quarter
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateRange('year')}
                    className={`py-2 px-4 text-sm font-medium rounded-r-lg border ${
                      dateRange === 'year'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    This Year
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlySales}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#10B981" activeDot={{ r: 8 }} strokeWidth={2} name="Sales (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status and Top Products Charts */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Order Status Distribution */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name.toLowerCase() === 'completed' ? '#10B981' :
                              entry.name.toLowerCase() === 'processing' ? '#FBBF24' :
                              entry.name.toLowerCase() === 'pending' ? '#60A5FA' :
                              entry.name.toLowerCase() === 'cancelled' ? '#EF4444' :
                              '#6B7280'
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} order(s)`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                {farmerOrders && farmerOrders.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {farmerOrders.slice(0, 5).map((order) => (
                      <li key={order._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-green-600 truncate">Order #{order._id.substring(0, 8)}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {order.farmerItems.length} item(s) from your farm
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">No recent orders found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">My Products</h2>
              <Link
                to="/add-product"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add New
              </Link>
            </div>
            
            {products.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                <p className="text-gray-500">You haven't added any products yet.</p>
                <Link
                  to="/add-product"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <li key={product._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">₹{product.price} per {product.unit}</div>
                            </div>
                          </div>
                          <div className="flex">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.status === 'available' ? 'bg-green-100 text-green-800' : 
                              product.status === 'sold_out' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {product.status}
                            </span>
                            <div className="ml-4 flex-shrink-0 flex">
                              <Link
                                to={`/products/${product._id}/edit`}
                                className="mr-2 font-medium text-green-600 hover:text-green-500"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {product.category} • {product.organic ? 'Organic' : 'Non-Organic'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Quantity: {product.quantity} {product.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>
            
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">Filter by status:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOrdersFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    ordersFilter === 'all' 
                      ? 'bg-gray-200 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setOrdersFilter('pending')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    ordersFilter === 'pending' 
                      ? 'bg-blue-200 text-blue-800 font-medium' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setOrdersFilter('processing')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    ordersFilter === 'processing' 
                      ? 'bg-yellow-200 text-yellow-800 font-medium' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => setOrdersFilter('completed')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    ordersFilter === 'completed' 
                      ? 'bg-green-200 text-green-800 font-medium' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setOrdersFilter('cancelled')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    ordersFilter === 'cancelled' 
                      ? 'bg-red-200 text-red-800 font-medium' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            {farmerOrders && farmerOrders.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {farmerOrders
                    .filter(order => ordersFilter === 'all' || order.status === ordersFilter)
                    .map((order) => {
                      // Calculate subtotal for this farmer's items
                      const subtotal = order.farmerItems.reduce((sum, item) => 
                        sum + (item.price * item.quantity), 0
                      );
                      
                      return (
                        <li key={order._id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-green-600 truncate">Order #{order._id.substring(0, 8)}</p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status || 'Pending'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  Customer: {order.consumer?.name || 'Unknown'}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  Date: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <h4 className="text-sm font-medium text-gray-900">Your Products in This Order:</h4>
                              <ul className="mt-2 divide-y divide-gray-200">
                                {order.farmerItems.map((item, index) => {
                                  const product = products.find(p => p._id === (item.product._id || item.product));
                                  return (
                                    <li key={index} className="py-2 flex justify-between text-sm">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                          {product && product.images && product.images.length > 0 ? (
                                            <img 
                                              src={product.images[0].url} 
                                              alt={product.name}
                                              className="h-full w-full object-cover object-center"
                                            />
                                          ) : (
                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                              <span className="text-xs text-gray-400">No image</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-4">
                                          <p className="font-medium text-gray-900">{product ? product.name : item.name || 'Unknown Product'}</p>
                                          <p className="text-gray-500">{item.quantity} x ₹{item.price} per {product ? product.unit : 'unit'}</p>
                                        </div>
                                      </div>
                                      <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-gray-900">
                                <p className="text-sm font-medium">Subtotal for your products:</p>
                                <p className="text-sm font-medium">₹{subtotal.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            {order.shippingDetails && (
                              <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4">
                                <div>
                                  <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : order.paymentMethod}
                                  </dd>
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                <p className="text-gray-500">No orders found for your products.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
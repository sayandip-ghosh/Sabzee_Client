import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Product API calls
export const productApi = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    try {
      // Ensure we're sending the farmer ID as a query parameter
      const params = { ...filters };
      if (params.farmer) {
        params.farmer = params.farmer.toString();
      }
      
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch products');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Rate a product (consumer only)
  rateProduct: async (productId, rating, review) => {
    try {
      const response = await api.post(`/products/${productId}/rate`, { rating, review });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to rate product');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Create a new product (farmer only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update product (farmer only)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product (farmer only)
  deleteProduct: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('Failed to delete product');
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with an error
        throw new Error(error.response.data.message || 'Failed to delete product');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please try again.');
      } else {
        // Something else went wrong
        throw error;
      }
    }
  }
};

// Order API calls
export const orderApi = {
  // Get all orders for current user
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Farmer API calls
export const farmerApi = {
  // Get all farmers
  getFarmers: async () => {
    try {
      const response = await api.get('/farmers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get farmer by ID
  getFarmerById: async (id) => {
    try {
      const response = await api.get(`/farmers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get farmer analytics (for farmer dashboard)
  getFarmerAnalytics: async () => {
    try {
      const response = await api.get('/farmers/analytics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get farmer profile
  getFarmerProfile: async () => {
    try {
      const response = await api.get('/farmers/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update farmer profile
  updateFarmerProfile: async (formData) => {
    try {
      const response = await api.put('/farmers/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// User API calls
export const userApi = {
  // Get current user profile (works for both farmer and consumer)
  getUserProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update consumer profile (basic profile update for consumers)
  updateConsumerProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/me', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Prediction API calls
export const predictionApi = {
  // Get disease prediction for an image
  predictDisease: async (imageUrl) => {
    try {
      const response = await api.post('/predictions', { imageUrl });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get prediction');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get prediction history for the logged-in farmer
  getPredictionHistory: async () => {
    try {
      const response = await api.get('/predictions');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch prediction history');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get specific prediction by ID
  getPredictionById: async (predictionId) => {
    try {
      const response = await api.get(`/predictions/${predictionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch prediction');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  }
};

// Yield Prediction API calls
export const yieldPredictionApi = {
  // Get yield prediction for crop inputs
  predictYield: async (yieldData) => {
    try {
      const response = await api.post('/yield-predictions', yieldData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get yield prediction');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get yield prediction history for the logged-in farmer
  getYieldPredictionHistory: async () => {
    try {
      const response = await api.get('/yield-predictions');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch yield prediction history');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get specific yield prediction by ID
  getYieldPredictionById: async (predictionId) => {
    try {
      const response = await api.get(`/yield-predictions/${predictionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch yield prediction');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  }
};

// Forum API calls
export const forumApi = {
  // Get all forum posts
  getPosts: async (params = {}) => {
    try {
      const response = await api.get('/forum', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch forum posts');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Get post by ID
  getPostById: async (id) => {
    try {
      const response = await api.get(`/forum/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new post
  createPost: async (postData) => {
    try {
      const response = await api.post('/forum', postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update post
  updatePost: async (id, postData) => {
    try {
      const response = await api.put(`/forum/${id}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete post
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/forum/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add comment to post
  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/forum/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/forum/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/unlike post
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/forum/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Cart API calls
export const cartApi = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch cart');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity) => {
    try {
      const response = await api.post('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to add item to cart');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Update item quantity in cart
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update cart');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to remove item');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  },

  // Checkout cart and create order
  checkout: async (shippingDetails) => {
    try {
      const response = await api.post('/orders/checkout', shippingDetails);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Checkout failed');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw error;
      }
    }
  }
};

export default api; 
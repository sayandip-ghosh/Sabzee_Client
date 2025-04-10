import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductsPage from './pages/ProductsPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ProfilePage from './pages/ProfilePage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CropScanPage from './pages/CropScanPage';
import CropScanHistoryPage from './pages/CropScanHistoryPage';
import CropScanDetailPage from './pages/CropScanDetailPage';
import YieldPredictionPage from './pages/YieldPredictionPage';
import YieldPredictionHistoryPage from './pages/YieldPredictionHistoryPage';
import YieldPredictionDetailPage from './pages/YieldPredictionDetailPage';
import ForumPage from './pages/ForumPage';
import ForumPostDetail from './pages/ForumPostDetail';
import CreateForumPost from './pages/CreateForumPost';
import EditForumPost from './pages/EditForumPost';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/products/:productId/edit" element={<EditProductPage />} />
              <Route path="/add-product" element={<AddProductPage />} />
              <Route path="/dashboard" element={<FarmerDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/crop-scan" element={<CropScanPage />} />
              <Route path="/crop-scan-history" element={<CropScanHistoryPage />} />
              <Route path="/crop-scan/:predictionId" element={<CropScanDetailPage />} />
              <Route path="/yield-prediction" element={<YieldPredictionPage />} />
              <Route path="/yield-prediction-history" element={<YieldPredictionHistoryPage />} />
              <Route path="/yield-prediction/:predictionId" element={<YieldPredictionDetailPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:postId" element={<ForumPostDetail />} />
              <Route path="/forum/create" element={<CreateForumPost />} />
              <Route path="/forum/:postId/edit" element={<EditForumPost />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold">Sabzee</h2>
                  <p className="text-sm text-gray-400 mt-1">Farm to consumer, directly.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Sabzee. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

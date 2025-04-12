import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forumApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import { FaPlus, FaThumbsUp, FaComment, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import TranslateText from '../components/TranslateText';

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch posts when page changes or search term changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        
        // Only add search filter if searchTerm is not empty
        if (searchTerm.trim()) {
          params.search = searchTerm;
        }
        
        const data = await forumApi.getPosts(params);
        setPosts(data.posts);
        setTotalPages(data.pages);
        setLoading(false);
      } catch (error) {
        setError('Failed to load forum posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchTerm]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if the user is a farmer
  if (user && user.role !== 'farmer') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-yellow-700">
                <TranslateText>The community forum is exclusively for farmers.</TranslateText>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <TranslateText>Farmers Community Forum</TranslateText>
        </h1>
        <button
          onClick={() => navigate('/forum/create')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> <TranslateText>New Post</TranslateText>
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search forum posts..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="p-2.5 ml-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
          >
            <TranslateText>Search</TranslateText>
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700"><TranslateText>{error}</TranslateText></p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            <TranslateText>No forum posts found.</TranslateText>
          </p>
          <button
            onClick={() => navigate('/forum/create')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <TranslateText>Create the first post</TranslateText>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <Link to={`/forum/${post._id}`} className="block">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  <TranslateText>{post.title}</TranslateText>
                </h2>
                <p className="text-gray-600 line-clamp-2 mb-4">
                  <TranslateText>{post.content}</TranslateText>
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center mr-4">
                    <FaThumbsUp className="mr-1" />
                    <span><TranslateText>{post.likes.length} likes</TranslateText></span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaComment className="mr-1" />
                    <span><TranslateText>{post.commentCount} comments</TranslateText></span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {post.author.profileImage ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={post.author.profileImage}
                        alt={post.author.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-800 font-medium text-sm">
                          {post.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{post.author.name}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <TranslateText>Previous</TranslateText>
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages).keys()].map((pageNum) => (
              <button
                key={pageNum + 1}
                onClick={() => setPage(pageNum + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  page === pageNum + 1
                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } text-sm font-medium`}
              >
                {pageNum + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <TranslateText>Next</TranslateText>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ForumPage; 
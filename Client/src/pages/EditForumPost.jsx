import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { forumApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import TranslateText from '../components/TranslateText';

const EditForumPost = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  
  const { title, content } = formData;
  
  // Fetch post details for editing
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await forumApi.getPostById(postId);
        const post = data.post;
        
        // Check if the user is the author
        if (post.author._id !== user?.id) {
          setError('You are not authorized to edit this post.');
          setLoading(false);
          return;
        }
        
        setOriginalPost(post);
        setFormData({
          title: post.title,
          content: post.content
        });
        setLoading(false);
      } catch (error) {
        setError('Failed to load the post. It may have been deleted.');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, user?.id]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    // No changes made
    if (title === originalPost.title && content === originalPost.content) {
      navigate(`/forum/${postId}`);
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await forumApi.updatePost(postId, formData);
      
      setSubmitting(false);
      navigate(`/forum/${postId}`);
    } catch (error) {
      setSubmitting(false);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update post. Please try again.'
      );
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state (not author or post not found)
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/forum" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
          <FaArrowLeft className="mr-2" /> <TranslateText>Back to Forum</TranslateText>
        </Link>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is a farmer
  if (user && user.role !== 'farmer') {
    navigate('/forum');
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/forum/${postId}`} className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
        <FaArrowLeft className="mr-2" /> <TranslateText>Back to Post</TranslateText>
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6"><TranslateText>Edit Post</TranslateText></h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              <TranslateText>Title</TranslateText> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="What is your question or topic?"
              className={`w-full px-4 py-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600"><TranslateText>{errors.title}</TranslateText></p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              <TranslateText>Content</TranslateText> <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={handleChange}
              placeholder="Provide details about your question or topic..."
              rows={8}
              className={`w-full px-4 py-2 border ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600"><TranslateText>{errors.content}</TranslateText></p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Link
              to={`/forum/${postId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
            >
              <TranslateText>Cancel</TranslateText>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 ${
                submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              <TranslateText>{submitting ? 'Saving...' : 'Save Changes'}</TranslateText>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForumPost; 
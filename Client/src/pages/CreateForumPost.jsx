import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { forumApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import TranslateText from '../components/TranslateText';

const CreateForumPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { title, content } = formData;
  
  // Check if user is a farmer
  if (user && user.role !== 'farmer') {
    navigate('/forum');
    return null;
  }
  
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
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await forumApi.createPost(formData);
      
      setLoading(false);
      navigate(`/forum/${response.post._id}`);
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Failed to create post. Please try again.'
      );
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/forum" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
        <FaArrowLeft className="mr-2" /> <TranslateText>Back to Forum</TranslateText>
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          <TranslateText>Create New Post</TranslateText>
        </h1>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700"><TranslateText>{errorMessage}</TranslateText></p>
              </div>
            </div>
          </div>
        )}
        
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
              to="/forum"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
            >
              <TranslateText>Cancel</TranslateText>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              <TranslateText>{loading ? 'Creating...' : 'Create Post'}</TranslateText>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateForumPost; 
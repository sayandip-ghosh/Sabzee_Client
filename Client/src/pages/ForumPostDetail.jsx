import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaThumbsUp, FaEdit, FaTrash, FaArrowLeft, FaReply } from 'react-icons/fa';
import { forumApi } from '../services/api';
import useAuth from '../hooks/useAuth';

const ForumPostDetail = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await forumApi.getPostById(postId);
        setPost(data.post);
        setLoading(false);
      } catch (error) {
        setError('Failed to load the post. It may have been deleted or you may not have permission to view it.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (liking) return;
    
    try {
      setLiking(true);
      const data = await forumApi.toggleLike(postId);
      
      // Update the post with the new likes array
      setPost({
        ...post,
        likes: data.likes
      });
      
      setLiking(false);
    } catch (error) {
      setError('Failed to like/unlike the post.');
      setLiking(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const data = await forumApi.addComment(postId, comment);
      
      // Add the new comment to the post's comments array
      setPost({
        ...post,
        comments: [data.comment, ...post.comments],
        commentCount: post.commentCount + 1
      });
      
      setComment('');
      setSubmitting(false);
    } catch (error) {
      setError('Failed to add comment. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    try {
      await forumApi.deleteComment(postId, commentId);
      
      // Filter out the deleted comment
      setPost({
        ...post,
        comments: post.comments.filter(comment => comment._id !== commentId),
        commentCount: post.commentCount - 1
      });
    } catch (error) {
      setError('Failed to delete comment.');
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    if (deleting) return;
    
    try {
      setDeleting(true);
      await forumApi.deletePost(postId);
      navigate('/forum');
    } catch (error) {
      setError('Failed to delete the post.');
      setDeleting(false);
    }
  };

  // Check if the user has liked the post
  const hasLiked = post?.likes.some(like => like === user?.id);

  // Check if the user is the author of the post
  const isAuthor = post?.author?._id === user?.id;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/forum" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Forum
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/forum" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Forum
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-600">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/forum" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
        <FaArrowLeft className="mr-2" /> Back to Forum
      </Link>

      {/* Post card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/forum/${postId}/edit`)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit post"
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={handleDeletePost}
                className="text-red-600 hover:text-red-800"
                title="Delete post"
                disabled={deleting}
              >
                <FaTrash size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Author info and date */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            {post.author.profileImage ? (
              <img
                className="h-10 w-10 rounded-full"
                src={post.author.profileImage}
                alt={post.author.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-800 font-medium">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        
        {/* Post content */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>
        
        {/* Like button */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            onClick={handleLikeToggle}
            disabled={liking}
            className={`flex items-center ${
              hasLiked ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <FaThumbsUp className="mr-2" />
            <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
          </button>
          <div className="text-gray-500">
            <span>{post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>
      </div>
      
      {/* Add comment form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a Comment</h2>
        <form onSubmit={handleCommentSubmit}>
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 ${
                submitting || !comment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Comments ({post.commentCount})
        </h2>
        
        {post.comments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {comment.author.profileImage ? (
                        <img
                          className="h-9 w-9 rounded-full"
                          src={comment.author.profileImage}
                          alt={comment.author.name}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-800 font-medium text-sm">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{comment.author.name}</p>
                        <span className="mx-2 text-gray-500">•</span>
                        <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                  
                  {comment.author._id === user?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete comment"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostDetail; 
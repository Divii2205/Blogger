import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { likesAPI } from '../utils/api';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import Card from './ui/Card';

const PostCard = ({ post, onLikeUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const response = await likesAPI.togglePostLike(post._id);
      // Use server response to ensure accurate state
      const serverData = response.data.data;
      setIsLiked(serverData.isLiked);
      setLikesCount(serverData.likesCount);
      
      if (onLikeUpdate) {
        onLikeUpdate(post._id, serverData.isLiked, serverData.likesCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card hover className="group">
      <Link to={`/post/${post._id}`} className="block">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar
            src={post.author?.avatar}
            alt={post.author?.fullName}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {post.author?.fullName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              @{post.author?.username} · {formatDate(post.publishedAt || post.createdAt)}
            </p>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-4 -mx-6">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-56 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          
          {post.excerpt && (
            <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3 text-sm">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="default" size="sm">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="default" size="sm">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{post.commentsCount || 0}</span>
              </span>
              <span>{post.readingTime || 1} min read</span>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center space-x-1 text-sm transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-5 h-5 transition-all ${
                  isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-red-500'
                }`}
                fill={isLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className={isLiked ? 'text-red-500 font-medium' : 'text-neutral-500 dark:text-neutral-400'}>
                {likesCount}
              </span>
            </button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default PostCard;


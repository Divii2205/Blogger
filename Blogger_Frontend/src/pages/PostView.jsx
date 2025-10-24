import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, commentsAPI, likesAPI, followsAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';

const PostView = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      const postData = response.data.data.post;
      setPost(postData);
      setIsLiked(postData.isLiked || false);
      setLikesCount(postData.likesCount || 0);
      
      // Check if following author
      if (isAuthenticated && postData.author._id !== user?._id) {
        checkFollowStatus(postData.author._id);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getPostComments(id);
      setComments(response.data.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const checkFollowStatus = async (authorId) => {
    try {
      const response = await followsAPI.getFollowStatus(authorId);
      setIsFollowing(response.data.data.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      await likesAPI.togglePostLike(id);
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      console.error('Failed to like post:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await followsAPI.toggleFollow(post.author._id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await commentsAPI.createComment({
        content: commentText,
        postId: id,
      });

      setComments([response.data.data.comment, ...comments]);
      setCommentText('');
      setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Post not found
          </h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const isAuthor = user?._id === post.author._id;

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to={`/profile/${post.author.username}`}
              className="flex items-center space-x-3 group"
            >
              <Avatar
                src={post.author.avatar}
                alt={post.author.fullName}
                size="lg"
              />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {post.author.fullName}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  @{post.author.username} · {formatDate(post.publishedAt || post.createdAt)}
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              {isAuthor ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/write?edit=${post._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeletePost}
                  >
                    Delete
                  </Button>
                </>
              ) : isAuthenticated && (
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <span>{post.views} views</span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="primary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-2xl mb-8"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div
            className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-serif whitespace-pre-wrap"
            style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}
          >
            {post.content}
          </div>
        </div>

        {/* Engagement */}
        <div className="flex items-center space-x-6 py-6 border-y border-neutral-200 dark:border-neutral-800 mb-8">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-red-500 transition-colors"
          >
            <svg
              className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
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
            <span className={`font-medium ${isLiked ? 'text-red-500' : ''}`}>
              {likesCount}
            </span>
          </button>

          <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="font-medium">{post.commentsCount}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <Card>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submittingComment}
                    disabled={!commentText.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <p className="text-center text-neutral-600 dark:text-neutral-400">
                <Link to="/login" className="text-primary-600 hover:underline">
                  Sign in
                </Link>{' '}
                to leave a comment
              </p>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card>
                <p className="text-center text-neutral-600 dark:text-neutral-400 py-4">
                  No comments yet. Be the first to comment!
                </p>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment._id}>
                  <div className="flex space-x-3">
                    <Avatar
                      src={comment.author.avatar}
                      alt={comment.author.fullName}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link
                          to={`/profile/${comment.author.username}`}
                          className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600"
                        >
                          {comment.author.fullName}
                        </Link>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default PostView;


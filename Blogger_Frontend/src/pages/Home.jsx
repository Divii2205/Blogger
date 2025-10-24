import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import PostCard from '../components/PostCard';
import Button from '../components/ui/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('publishedAt');

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        page: pageNum,
        limit: 10,
        sortBy,
        order: 'desc',
      });

      const newPosts = response.data.data.posts;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(response.data.data.pagination.page < response.data.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchPosts(page + 1);
  };

  const handleLikeUpdate = (postId, isLiked, likesCount) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, isLiked, likesCount } : post
      )
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome to Blogger
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          {!isAuthenticated && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button variant="primary" size="lg" onClick={() => window.location.href = '/register'}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Latest Posts
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('publishedAt')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'publishedAt'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('likesCount')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'likesCount'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-neutral-400 dark:text-neutral-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No posts yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Be the first to share your story!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  loading={loading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;


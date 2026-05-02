import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePostsListQuery } from '../features/posts/hooks/usePostQueries';
import Layout from '../components/layout/Layout';
import PageContainer from '../components/layout/PageContainer';
import PostCard from '../components/PostCard';
import PostsSearchBar from '../components/PostsSearchBar';
import Button from '../components/ui/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('publishedAt');
  const [filters, setFilters] = useState({ q: '', tag: '' });

  const { data, isLoading: loading } = usePostsListQuery({
    page,
    limit: 10,
    sortBy,
    order: 'desc',
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.tag ? { tag: filters.tag } : {}),
  });

  // Reset pagination whenever the filter or sort changes — otherwise loading
  // page 2 with new filters appends a different result set on top of the old.
  useEffect(() => {
    setPosts([]);
    setPage(1);
  }, [sortBy, filters.q, filters.tag]);

  useEffect(() => {
    if (!data) return;
    setPosts(prev => (page === 1 ? data.posts : [...prev, ...data.posts]));
    setHasMore(data.pagination.page < data.pagination.pages);
  }, [data, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
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
      <PageContainer paddingY="py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome to Blogger
          </h1>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
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

        <PostsSearchBar
          query={filters.q}
          tag={filters.tag}
          onChange={setFilters}
        />

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </PageContainer>
    </Layout>
  );
};

export default Home;


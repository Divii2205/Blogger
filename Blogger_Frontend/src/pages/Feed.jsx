import React, { useState, useEffect } from 'react';
import { useFeedPostsQuery } from '../features/posts/hooks/usePostQueries';
import Layout from '../components/layout/Layout';
import PageContainer from '../components/layout/PageContainer';
import PostCard from '../components/PostCard';
import Button from '../components/ui/Button';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading: loading } = useFeedPostsQuery({ page, limit: 10 });

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
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Your Feed
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Posts from writers you follow
          </p>
        </div>

        {/* Posts */}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Your feed is empty
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Follow writers to see their posts here
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/explore'}>
              Explore Writers
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>

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

export default Feed;


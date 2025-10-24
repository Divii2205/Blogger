import React, { useState, useEffect } from 'react';
import { postsAPI, usersAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import PostCard from '../components/PostCard';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrending();
    fetchUsers();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await postsAPI.getTrending({ limit: 10 });
      setTrendingPosts(response.data.data.posts);
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers({ limit: 10 });
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await usersAPI.getUsers({ search: searchQuery });
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeUpdate = (postId, isLiked, likesCount) => {
    setTrendingPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, isLiked, likesCount } : post
      )
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Explore
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Discover trending posts and talented writers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Trending Posts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Trending Posts
            </h2>
            
            {loading && trendingPosts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : trendingPosts.length === 0 ? (
              <Card>
                <p className="text-center text-neutral-600 dark:text-neutral-400 py-8">
                  No trending posts yet
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {trendingPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLikeUpdate={handleLikeUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Writers */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Discover Writers
              </h2>

              {/* Search */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search writers..."
                    className="flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button onClick={handleSearch} variant="primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <Card padding="none">
                {loading && users.length === 0 ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-neutral-600 dark:text-neutral-400 p-4">
                    No writers found
                  </p>
                ) : (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {users.map((user) => (
                      <Link
                        key={user._id}
                        to={`/profile/${user.username}`}
                        className="flex items-center space-x-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <Avatar
                          src={user.avatar}
                          alt={user.fullName}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            @{user.username}
                          </p>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {user.followersCount || 0} followers
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;


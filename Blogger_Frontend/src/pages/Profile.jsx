import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, postsAPI, followsAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import PostCard from '../components/PostCard';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('published');

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [username, activeTab]);

  const fetchUserProfile = async () => {
    try {
      const response = await usersAPI.getUser(username);
      setUser(response.data.data.user);
      setIsFollowing(response.data.data.isFollowing || false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postsAPI.getUserPosts(username, {
        status: activeTab,
      });
      setPosts(response.data.data.posts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await followsAPI.toggleFollow(user._id);
      setIsFollowing(!isFollowing);
      setUser(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
      }));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleLikeUpdate = (postId, isLiked, likesCount) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, isLiked, likesCount } : post
      )
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            User not found
          </h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <Avatar
              src={user.avatar}
              alt={user.fullName}
              size="2xl"
              className="mx-auto md:mx-0 mb-4 md:mb-0"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {user.fullName}
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    @{user.username}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      Edit Profile
                    </Button>
                  ) : isAuthenticated && (
                    <Button
                      variant={isFollowing ? 'outline' : 'primary'}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>

              {user.bio && (
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start space-x-6 text-sm">
                {user.location && (
                  <div className="flex items-center space-x-1 text-neutral-600 dark:text-neutral-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-primary-600 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Website</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-6 mt-4">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {user.postsCount || 0}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    Posts
                  </span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {user.followersCount || 0}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    Followers
                  </span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {user.followingCount || 0}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    Following
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        {isOwnProfile && (
          <div className="flex space-x-2 mb-6 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'published'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'draft'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Drafts
            </button>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
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
              {isOwnProfile && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/write')}
                >
                  Write your first post
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;


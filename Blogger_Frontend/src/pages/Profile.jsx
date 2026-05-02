import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, followsAPI } from '../utils/api';
import { postKeys, useProfileQuery, useUserPostsQuery } from '../features/posts/hooks/usePostQueries';
import Layout from '../components/layout/Layout';
import PageContainer from '../components/layout/PageContainer';
import PostCard from '../components/PostCard';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FollowersModal from '../components/FollowersModal';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('published');
  const [followersModal, setFollowersModal] = useState(null); // 'followers' | 'following' | null

  const { data: profileData, isLoading: loadingProfile } = useProfileQuery(username);
  const { data: userPosts = [], isLoading: loadingPosts } = useUserPostsQuery(
    username,
    { status: activeTab },
    { enabled: activeTab !== 'saved' }
  );

  // Bookmarks query — only enabled when the saved tab is active and we're
  // looking at our own profile (server enforces owner-only via the JWT).
  const isOwnProfile = currentUser?.username === username;
  const { data: bookmarksData, isLoading: loadingBookmarks } = useQuery({
    queryKey: ['bookmarks', currentUser?._id],
    queryFn: async () => (await usersAPI.getBookmarks()).data.data,
    enabled: activeTab === 'saved' && isOwnProfile,
  });

  const user = profileData?.user || null;
  const isFollowing = profileData?.isFollowing || false;

  const posts = activeTab === 'saved'
    ? bookmarksData?.posts || []
    : userPosts;

  const loading = loadingProfile || (activeTab === 'saved' ? loadingBookmarks : loadingPosts);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistic patch via the React Query cache so the header updates
    // instantly. We refresh from the server response below; if that fails
    // the next refetch / mount will reconcile to the source of truth.
    queryClient.setQueryData(postKeys.profile(username), (prev) => {
      if (!prev) return prev;
      const wasFollowing = prev.isFollowing;
      return {
        ...prev,
        isFollowing: !wasFollowing,
        user: {
          ...prev.user,
          followersCount: (prev.user.followersCount || 0) + (wasFollowing ? -1 : 1),
        },
      };
    });

    try {
      const response = await followsAPI.toggleFollow(user._id);
      const serverData = response.data.data;
      queryClient.setQueryData(postKeys.profile(username), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowing: serverData.isFollowing,
          user: {
            ...prev.user,
            followersCount: serverData.targetUser.followersCount,
            followingCount: serverData.targetUser.followingCount,
          },
        };
      });
    } catch (error) {
      console.error('Failed to follow user:', error);
      queryClient.invalidateQueries({ queryKey: postKeys.profile(username) });
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer paddingY="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <PageContainer paddingY="py-16" className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            User not found
          </h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer paddingY="py-8">
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="flex justify-center md:justify-start shrink-0">
              <Avatar src={user.avatar} alt={user.fullName} size="2xl" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {user.fullName}
                  </h1>
                  <p className="text-lg text-neutral-500 dark:text-neutral-400">
                    @{user.username}
                  </p>
                </div>

                <div className="flex justify-center md:justify-start">
                  {isOwnProfile ? (
                    <Button variant="outline" onClick={() => navigate('/settings')}>
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
                <p className="text-neutral-700 dark:text-neutral-300 text-base leading-relaxed">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start flex-wrap gap-4 text-sm">
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
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297a12 12 0 00-3.794 23.388c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.467-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.323 3.301 1.23a11.5 11.5 0 016.003 0c2.291-1.553 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.103.823 2.222v3.293c0 .32.218.694.825.576A12 12 0 0012 .297" />
                    </svg>
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
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
                <button
                  type="button"
                  onClick={() => setFollowersModal('followers')}
                  className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {user.followersCount || 0}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    Followers
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFollowersModal('following')}
                  className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {user.followingCount || 0}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    Following
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {isOwnProfile && (
          <div className="flex space-x-2 mb-6 border-b border-neutral-200 dark:border-neutral-800">
            {[
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' },
              { key: 'saved', label: 'Saved' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

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
                {activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
              </h3>
              {isOwnProfile && activeTab !== 'saved' && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/write')}
                >
                  Write a post now
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </PageContainer>

      <FollowersModal
        open={followersModal !== null}
        onClose={() => setFollowersModal(null)}
        username={username}
        mode={followersModal || 'followers'}
      />
    </Layout>
  );
};

export default Profile;

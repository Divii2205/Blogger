import axios from 'axios';

// For local development, use localhost. For production, use Render URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on specific 401 errors (not CORS or network errors)
    if (error.response?.status === 401 && error.response?.data?.message) {
      // Check if it's an actual auth error, not a CORS or network issue
      const authErrors = ['Invalid token', 'Token expired', 'No token provided', 'Not authorized'];
      if (authErrors.some(msg => error.response.data.message.includes(msg))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Posts APIs
export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getFeed: (params) => api.get('/posts/feed', { params }),
  getTrending: (params) => api.get('/posts/trending', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (username, params) => api.get(`/posts/user/${username}`, { params }),
};

// Users APIs
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (data) => api.put('/users/avatar', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getFollowers: (username) => api.get(`/users/${username}/followers`),
  getFollowing: (username) => api.get(`/users/${username}/following`),
};

// Follows APIs
export const followsAPI = {
  toggleFollow: (userId) => api.post(`/follows/${userId}`),
  getFollowStatus: (userId) => api.get(`/follows/${userId}/status`),
  getSuggestions: (params) => api.get('/follows/suggestions', { params }),
};

// Likes APIs
export const likesAPI = {
  togglePostLike: (postId) => api.post(`/likes/post/${postId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/comment/${commentId}`),
  getPostLikes: (postId) => api.get(`/likes/post/${postId}/users`),
  getUserLikedPosts: (userId, params) => api.get(`/likes/user/${userId}/posts`, { params }),
};

// Comments APIs
export const commentsAPI = {
  getPostComments: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  getComment: (id) => api.get(`/comments/${id}`),
};

export default api;


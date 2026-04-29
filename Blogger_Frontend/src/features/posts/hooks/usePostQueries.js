import { useQuery } from "@tanstack/react-query";
import { postsAPI, usersAPI, commentsAPI } from "../../../utils/api";

export const postKeys = {
  all: ["posts"],
  list: (params) => [...postKeys.all, "list", params],
  trending: (params) => [...postKeys.all, "trending", params],
  feed: (params) => [...postKeys.all, "feed", params],
  detail: (id) => [...postKeys.all, "detail", id],
  detailBySlug: (slug) => [...postKeys.all, "detailBySlug", slug],
  byUser: (username, params) => [...postKeys.all, "byUser", username, params],
  comments: (postId) => [...postKeys.all, "comments", postId],
  users: (params) => ["users", params],
  profile: (username) => ["profile", username],
};

export const usePostsListQuery = (params) =>
  useQuery({
    queryKey: postKeys.list(params),
    queryFn: async () => (await postsAPI.getPosts(params)).data.data,
  });

export const useTrendingPostsQuery = (params) =>
  useQuery({
    queryKey: postKeys.trending(params),
    queryFn: async () => (await postsAPI.getTrending(params)).data.data.posts,
  });

export const useFeedPostsQuery = (params) =>
  useQuery({
    queryKey: postKeys.feed(params),
    queryFn: async () => (await postsAPI.getFeed(params)).data.data,
  });

export const usePostDetailQuery = (id) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => (await postsAPI.getPost(id)).data.data.post,
    enabled: Boolean(id),
  });

export const usePostBySlugQuery = (slug) =>
  useQuery({
    queryKey: postKeys.detailBySlug(slug),
    queryFn: async () => (await postsAPI.getPostBySlug(slug)).data.data.post,
    enabled: Boolean(slug),
  });

export const usePostCommentsQuery = (postId) =>
  useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: async () => (await commentsAPI.getPostComments(postId)).data.data.comments,
    enabled: Boolean(postId),
  });

export const useUsersQuery = (params) =>
  useQuery({
    queryKey: postKeys.users(params),
    queryFn: async () => (await usersAPI.getUsers(params)).data.data.users,
  });

export const useProfileQuery = (username) =>
  useQuery({
    queryKey: postKeys.profile(username),
    queryFn: async () => (await usersAPI.getUser(username)).data.data,
    enabled: Boolean(username),
  });

export const useUserPostsQuery = (username, params) =>
  useQuery({
    queryKey: postKeys.byUser(username, params),
    queryFn: async () => (await postsAPI.getUserPosts(username, params)).data.data.posts,
    enabled: Boolean(username),
  });

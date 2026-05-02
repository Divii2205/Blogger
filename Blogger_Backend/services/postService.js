const AppError = require("../utils/appError");
const { parsePagination } = require("../utils/query");
const postRepository = require("../repositories/postRepository");

const withLikeStatus = (post, userId) => {
  const postObj = post.toObject();
  if (userId) {
    postObj.isLiked = post.isLikedBy(userId);
  }
  return postObj;
};

// Escape user input before stuffing it into a regex so a title query like
// "node.js (v20)" doesn't blow up regex compilation or match unintended docs.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listPublishedPosts = async (queryParams, authUser) => {
  const { page, limit, skip } = parsePagination(queryParams);
  const sortBy = queryParams.sortBy || "publishedAt";
  const order = queryParams.order === "asc" ? 1 : -1;
  const query = { status: "published" };

  if (queryParams.tag) {
    query.tags = { $in: [queryParams.tag.toLowerCase()] };
  }

  const q = (queryParams.q || "").trim();
  if (q) {
    query.title = { $regex: escapeRegExp(q), $options: "i" };
  }

  if (queryParams.author) {
    const authorUser = await postRepository.findAuthorByUsername(queryParams.author);
    if (authorUser) {
      query.author = authorUser._id;
    } else {
      return {
        posts: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }
  }

  const [posts, total] = await Promise.all([
    postRepository.findPosts(query, { [sortBy]: order }, skip, limit),
    postRepository.countPosts(query),
  ]);

  return {
    posts: posts.map((post) => withLikeStatus(post, authUser?._id)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const listTrendingPosts = async (queryParams, authUser) => {
  const limit = Math.max(1, Math.min(20, parseInt(queryParams.limit, 10) || 10));
  const timeframe = parseInt(queryParams.timeframe, 10) || 7;
  const date = new Date();
  date.setDate(date.getDate() - timeframe);

  const query = { status: "published", publishedAt: { $gte: date } };
  if (queryParams.tag) {
    query.tags = { $in: [queryParams.tag.toLowerCase()] };
  }
  const q = (queryParams.q || "").trim();
  if (q) {
    query.title = { $regex: escapeRegExp(q), $options: "i" };
  }

  const posts = await postRepository.findPosts(
    query,
    { likesCount: -1, views: -1, publishedAt: -1 },
    0,
    limit
  );

  return posts.map((post) => withLikeStatus(post, authUser?._id));
};

const listFeedPosts = async (queryParams, authUser) => {
  const { page, limit, skip } = parsePagination(queryParams);
  const user = await postRepository.findUserFollowing(authUser._id);
  const followingIds = user?.following || [];

  if (followingIds.length === 0) {
    return {
      posts: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  const query = {
    author: { $in: followingIds, $ne: authUser._id },
    status: "published",
  };

  if (queryParams.tag) {
    query.tags = { $in: [queryParams.tag.toLowerCase()] };
  }
  const q = (queryParams.q || "").trim();
  if (q) {
    query.title = { $regex: escapeRegExp(q), $options: "i" };
  }

  const [posts, total] = await Promise.all([
    postRepository.findPosts(query, { publishedAt: -1 }, skip, limit),
    postRepository.countPosts(query),
  ]);

  return {
    posts: posts.map((post) => withLikeStatus(post, authUser._id)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// Authors viewing their own posts shouldn't pad their view count; everyone
// else does. Increment is atomic so concurrent reads can't drop a count.
const maybeIncrementViews = async (post, authUser) => {
  const isAuthor =
    authUser && post.author?._id?.toString() === authUser._id.toString();
  if (isAuthor) return;
  await postRepository.incrementViews(post._id);
  post.views = (post.views || 0) + 1;
};

const getPostById = async (id, authUser) => {
  const post = await postRepository.findPostById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  await maybeIncrementViews(post, authUser);
  return withLikeStatus(post, authUser?._id);
};

const getPostBySlug = async (slug, authUser) => {
  const post = await postRepository.findPostBySlug(slug);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  await maybeIncrementViews(post, authUser);
  return withLikeStatus(post, authUser?._id);
};

const createPost = async (payload, authUser) => {
  const post = await postRepository.createPost({
    title: payload.title,
    content: payload.content,
    tags: (payload.tags || []).map((tag) => tag.toLowerCase().trim()),
    author: authUser._id,
    status: payload.status || "draft",
    featuredImage: payload.featuredImage,
    excerpt: payload.excerpt,
    publishedAt: payload.status === "published" ? new Date() : null,
    lastEditedAt: new Date(),
    metadata: payload.metadata || {},
  });

  await postRepository.populateAuthor(post);
  await postRepository.incrementUserPostCount(authUser._id, 1);
  return post;
};

const updatePost = async (postId, payload, authUser) => {
  const post = await postRepository.findRawPostById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (post.author.toString() !== authUser._id.toString()) {
    throw new AppError("Not authorized to update this post", 403);
  }

  const previousStatus = post.status;
  if (payload.title !== undefined) post.title = payload.title;
  if (payload.content !== undefined) post.content = payload.content;
  if (payload.tags !== undefined) {
    post.tags = payload.tags.map((tag) => tag.toLowerCase().trim());
  }
  if (payload.status !== undefined) post.status = payload.status;
  if (payload.featuredImage !== undefined) post.featuredImage = payload.featuredImage;
  if (payload.excerpt !== undefined) post.excerpt = payload.excerpt;
  if (payload.status === "published" && previousStatus !== "published") {
    post.publishedAt = new Date();
  }
  post.lastEditedAt = new Date();
  if (payload.metadata !== undefined) {
    post.metadata = { ...(post.metadata || {}), ...payload.metadata };
  }

  await post.save();
  await postRepository.populateAuthor(post);
  return post;
};

const deletePost = async (postId, authUser) => {
  const post = await postRepository.findRawPostById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (post.author.toString() !== authUser._id.toString()) {
    throw new AppError("Not authorized to delete this post", 403);
  }

  await postRepository.cascadeDeletePost(postId);
  await postRepository.incrementUserPostCount(authUser._id, -1);
};

const getPostsByUsername = async (username, queryParams, authUser) => {
  const user = await postRepository.findAuthorByUsername(username);
  if (!user) throw new AppError("User not found", 404);
  const { page, limit, skip } = parsePagination(queryParams);

  const isOwner =
    authUser && authUser._id.toString() === user._id.toString();
  const requestedStatus = queryParams.status || "published";
  const status = isOwner ? requestedStatus : "published";

  const query = { author: user._id };
  if (status !== "all") {
    query.status = status;
  }

  const [posts, total] = await Promise.all([
    postRepository.findPosts(query, { createdAt: -1 }, skip, limit),
    postRepository.countPosts(query),
  ]);

  return {
    posts: posts.map((post) => withLikeStatus(post, authUser?._id)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const getPopularTags = async (queryParams) => {
  const limit = Math.max(1, Math.min(50, parseInt(queryParams.limit, 10) || 20));
  const tags = await postRepository.aggregatePopularTags(limit);
  return { tags };
};

module.exports = {
  listPublishedPosts,
  listTrendingPosts,
  listFeedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByUsername,
  getPopularTags,
};

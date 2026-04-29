import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  postsAPI,
  commentsAPI,
  likesAPI,
  followsAPI,
  usersAPI,
} from "../utils/api";
import {
  usePostDetailQuery,
  usePostCommentsQuery,
  usePostBySlugQuery,
} from "../features/posts/hooks/usePostQueries";
import Layout from "../components/layout/Layout";
import PageContainer from "../components/layout/PageContainer";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Textarea from "../components/ui/Textarea";

const PostView = () => {
  const { id, slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isSlugRoute = Boolean(slug);
  const { data: postByIdData, isLoading: loadingById } = usePostDetailQuery(
    !isSlugRoute ? id : null,
  );
  const { data: postBySlugData, isLoading: loadingBySlug } = usePostBySlugQuery(
    isSlugRoute ? slug : null,
  );
  const postData = isSlugRoute ? postBySlugData : postByIdData;
  const effectivePostId = postData?._id || id;
  const { data: commentsData = [], isLoading: loadingComments } =
    usePostCommentsQuery(effectivePostId);

  useEffect(() => {
    if (user && user.savedPosts && effectivePostId) {
      setIsSaved(user.savedPosts.includes(effectivePostId));
    }
  }, [user, effectivePostId]);

  useEffect(() => {
    if (!postData) return;
    setPost(postData);
    setIsLiked(postData.isLiked || false);
    setLikesCount(postData.likesCount || 0);
    if (isAuthenticated && postData.author._id !== user?._id) {
      checkFollowStatus(postData.author._id);
    }
  }, [postData, isAuthenticated, user]);

  useEffect(() => {
    if (!postData?.slug) return;
    if (!isSlugRoute) {
      navigate(`/p/${postData.slug}`, { replace: true });
    }
  }, [postData, isSlugRoute, navigate]);

  useEffect(() => {
    setComments(commentsData);
  }, [commentsData]);

  const loading = loadingById || loadingBySlug || loadingComments;

  const markdownData = useMemo(() => {
    const raw = post?.content || "";
    const tokens = marked.lexer(raw);
    const headings = tokens
      .filter((token) => token.type === "heading" && token.depth <= 3)
      .map((token) => {
        const text = token.text.trim();
        const tocSlug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        return { text, depth: token.depth, id: tocSlug };
      });

    const renderer = new marked.Renderer();
    renderer.heading = ({ tokens: headingTokens, depth }) => {
      const text = headingTokens
        .map((t) => t.raw || t.text || "")
        .join("")
        .trim();
      const headingId = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return `<h${depth} id="${headingId}">${text}</h${depth}>`;
    };

    marked.setOptions({ renderer, breaks: true, gfm: true });
    const unsafeHtml = marked.parse(raw);
    const safeHtml = DOMPurify.sanitize(unsafeHtml, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "em",
        "blockquote",
        "ul",
        "ol",
        "li",
        "a",
        "code",
        "pre",
        "hr",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "id"],
    });

    return { safeHtml, headings };
  }, [post]);

  const checkFollowStatus = async (authorId) => {
    try {
      const response = await followsAPI.getFollowStatus(authorId);
      setIsFollowing(response.data.data.isFollowing);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const response = await likesAPI.togglePostLike(effectivePostId);
      // Use server response to ensure accurate state
      const serverData = response.data.data;
      setIsLiked(serverData.isLiked);
      setLikesCount(serverData.likesCount);
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error("Failed to like post:", error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousIsSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const response = await usersAPI.toggleBookmark(effectivePostId);
      setIsSaved(response.data.data.isSaved);
    } catch (error) {
      setIsSaved(previousIsSaved);
      console.error("Failed to bookmark post:", error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousIsFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const response = await followsAPI.toggleFollow(post.author._id);
      const serverData = response.data.data;

      // Update with server data for accuracy
      setIsFollowing(serverData.isFollowing);

      // Update post author's follower count if needed
      if (post.author) {
        setPost((prev) => ({
          ...prev,
          author: {
            ...prev.author,
            followersCount: serverData.targetUser.followersCount,
          },
        }));
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousIsFollowing);
      console.error("Failed to follow user:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await commentsAPI.createComment({
        content: commentText,
        postId: effectivePostId,
      });

      setComments([response.data.data.comment, ...comments]);
      setCommentText("");
      setPost((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await postsAPI.deletePost(effectivePostId);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer paddingY="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <PageContainer paddingY="py-16" className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
            Post not found
          </h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </PageContainer>
      </Layout>
    );
  }

  const isAuthor = user?._id === post.author._id;

  return (
    <Layout>
      <PageContainer paddingY="py-8">
        <article>
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
                    @{post.author.username} ·{" "}
                    {formatDate(post.publishedAt || post.createdAt)}
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
                ) : (
                  isAuthenticated && (
                    <Button
                      variant={isFollowing ? "outline" : "primary"}
                      size="sm"
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Title */}
            <div className="flex-1 flex justify-end items-start gap-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
                {post.metadata?.seoTitle || post.title}
              </h1>

              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 transition-colors mt-3 ${
                  isSaved
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
                  fill={isSaved ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span className="font-medium hidden sm:inline">
                  {isSaved ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              <span>{post.readingTime} min read</span>
              <span>·</span>
              <span>{post.views} views</span>
              {post.lastEditedAt && (
                <>
                  <span>·</span>
                  <span>Updated {formatDate(post.lastEditedAt)}</span>
                </>
              )}
            </div>
            {post.metadata?.canonicalUrl && (
              <a
                href={post.metadata.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Canonical source
              </a>
            )}
          </div>

          {/* Article Content Card */}
          <Card className="mb-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {/* Featured Image */}
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto max-h-96 object-cover rounded-lg mb-10"
                />
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 mt-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="primary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                className="whitespace-pre-wrap mt-10"
                dangerouslySetInnerHTML={{ __html: markdownData.safeHtml }}
              />
            </article>
          </Card>

          {/* Engagement */}
          <div className="flex items-center space-x-6 py-6 border-y border-neutral-200 dark:border-neutral-800 mb-8">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-red-500 transition-colors"
            >
              <svg
                className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                fill={isLiked ? "currentColor" : "none"}
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
              <span className={`font-medium ${isLiked ? "text-red-500" : ""}`}>
                {likesCount}
              </span>
            </button>

            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
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
                  <Link
                    to="/login"
                    className="text-primary-600 hover:underline"
                  >
                    Sign in
                  </Link>{" "}
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
      </PageContainer>
    </Layout>
  );
};

export default PostView;

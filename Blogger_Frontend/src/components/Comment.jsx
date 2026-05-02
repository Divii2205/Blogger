import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { commentsAPI, likesAPI } from "../utils/api";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Textarea from "./ui/Textarea";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const Comment = ({ comment, onMutated, depth = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  // Optimistic mirror of server-side like state. The parent refetch will
  // overwrite this on next mutation so we don't drift indefinitely.
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const isOwner = user && comment.author?._id === user._id;
  const canShowActions = isAuthenticated && !comment.isDeleted;

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === comment.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await commentsAPI.updateComment(comment._id, { content: editText });
      setEditing(false);
      onMutated?.();
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment? Replies will remain visible.")) return;
    try {
      await commentsAPI.deleteComment(comment._id);
      onMutated?.();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setPostingReply(true);
    try {
      await commentsAPI.createComment({
        content: replyText,
        postId: comment.post,
        // Replies always nest under the top-level parent so we get a single
        // depth of indentation. parentComment chains were never traversed
        // beyond one level on the server side.
        parentCommentId: comment.parentComment || comment._id,
      });
      setReplyText("");
      setReplying(false);
      onMutated?.();
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setPostingReply(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const response = await likesAPI.toggleCommentLike(comment._id);
      setIsLiked(response.data.data.isLiked);
      setLikesCount(response.data.data.likesCount);
    } catch (error) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Failed to like comment:", error);
    }
  };

  return (
    <div className={depth > 0 ? "pl-6 border-l-2 border-neutral-200 dark:border-neutral-800" : ""}>
      <div className="flex space-x-3">
        <Avatar src={comment.author.avatar} alt={comment.author.fullName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <Link
              to={`/profile/${comment.author.username}`}
              className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600"
            >
              {comment.author.fullName}
            </Link>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && comment.editedAt && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                · edited {formatDate(comment.editedAt)}
              </span>
            )}
            {comment.isDeleted && (
              <span className="text-xs text-neutral-500 italic">· deleted</span>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveEdit}
                  loading={saving}
                  disabled={!editText.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditText(comment.content);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={`text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap ${
                comment.isDeleted ? "italic text-neutral-500" : ""
              }`}
            >
              {comment.content}
            </p>
          )}

          {canShowActions && !editing && (
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked
                    ? "text-red-500"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-red-500"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
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
                <span>{likesCount}</span>
              </button>

              {/* Replies only nest one level deep, so don't show "Reply" on a reply. */}
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => setReplying((v) => !v)}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600"
                >
                  Reply
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author.fullName}...`}
                rows={2}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleReply}
                  loading={postingReply}
                  disabled={!replyText.trim()}
                >
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyText("");
                    setReplying(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  onMutated={onMutated}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;

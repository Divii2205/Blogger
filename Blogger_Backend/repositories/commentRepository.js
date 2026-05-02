const Comment = require("../models/Comment");
const Post = require("../models/Post");

const findById = (id) => Comment.findById(id);

const findByIdWithAuthor = (id) =>
  Comment.findById(id).populate("author", "username fullName avatar");

const findByIdWithReplies = (id) =>
  Comment.findById(id)
    .populate("author", "username fullName avatar")
    .populate({
      path: "replies",
      populate: { path: "author", select: "username fullName avatar" },
      options: { sort: { createdAt: 1 } },
    });

// Hide soft-deleted parents UNLESS they have replies — otherwise the
// surviving replies vanish along with the tombstone parent.
const topLevelFilter = (postId) => ({
  post: postId,
  parentComment: null,
  $or: [
    { isDeleted: false },
    { isDeleted: true, "replies.0": { $exists: true } },
  ],
});

const findTopLevelByPost = (postId, skip, limit) =>
  Comment.find(topLevelFilter(postId))
    .populate("author", "username fullName avatar")
    .populate({
      path: "replies",
      populate: { path: "author", select: "username fullName avatar" },
      options: { sort: { createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

const countTopLevelByPost = (postId) =>
  Comment.countDocuments(topLevelFilter(postId));

const createComment = (data) => Comment.create(data);

const pushReply = (parentId, replyId) =>
  Comment.updateOne({ _id: parentId }, { $push: { replies: replyId } });

const incPostCommentCount = (postId, value) =>
  Post.updateOne({ _id: postId }, { $inc: { commentsCount: value } });

module.exports = {
  findById,
  findByIdWithAuthor,
  findByIdWithReplies,
  findTopLevelByPost,
  countTopLevelByPost,
  createComment,
  pushReply,
  incPostCommentCount,
};

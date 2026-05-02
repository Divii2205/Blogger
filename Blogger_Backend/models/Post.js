const mongoose = require('mongoose');

const createSlug = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  lastEditedAt: {
    type: Date
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 1
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBookmarked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    seoTitle: {
      type: String,
      maxlength: [120, 'SEO title cannot exceed 120 characters']
    },
    canonicalUrl: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      maxlength: [300, 'Meta description cannot exceed 300 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  }
}, {
  timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ views: -1 });
// `sparse` so untitled drafts (slug = undefined) don't collide on the
// unique index. Single source for the slug index — the schema field used to
// re-declare it via `unique: true` and `index: true`, tripping warnings.
postSchema.index({ slug: 1 }, { unique: true, sparse: true });
// Backs atomic isPostLikedBy checks used by likeService.
postSchema.index({ "likes.user": 1 });

// Calculate reading time before saving
postSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  next();
});

// Generate excerpt if not provided
postSchema.pre('save', function(next) {
  if (this.content && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  next();
});

postSchema.pre('save', async function(next) {
  if (!this.isModified('title') && this.slug) {
    return next();
  }

  const baseSlug = createSlug(this.title || '');
  if (!baseSlug) {
    this.slug = undefined;
    return next();
  }

  let slug = baseSlug;
  let counter = 1;
  while (await mongoose.models.Post.exists({ slug, _id: { $ne: this._id } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
  this.slug = slug;
  next();
});

// Update likes count
postSchema.methods.updateLikesCount = function() {
  this.likesCount = this.likes.length;
  return this.save();
};

// Check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId });
    this.likesCount = this.likes.length;
  }
  return this.save();
};

// Remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  this.likesCount = this.likes.length;
  return this.save();
};

// Increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Virtual for post URL
postSchema.virtual('postUrl').get(function() {
  return `/api/posts/${this._id}`;
});

// Transform JSON output
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Post', postSchema);

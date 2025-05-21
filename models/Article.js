const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Team News', 'Match Reports', 'Interviews', 'Community']
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author']
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredImage: {
    type: String,
    default: 'default-article.jpg'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

//Create slug from title before saving
ArticleSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  
  this.slug = this.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);
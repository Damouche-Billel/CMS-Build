const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Jerseys', 'Apparel', 'Accessories', 'Souvenirs', 'Equipment']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock information'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false
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

//Create slug from name before saving
MerchandiseSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  
  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Merchandise', MerchandiseSchema);
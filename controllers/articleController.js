const Article = require('../models/Article');
const path = require('path');
const fs = require('fs');

//Get all articles
exports.getArticles = async (req, res) => {
  try {
    //Build query
    let query;
    const reqQuery = { ...req.query };
    
    //Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    //Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    //Finding resource
    query = Article.find(JSON.parse(queryStr));
    
    //Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Article.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    //Execute query
    const articles = await query;
    
    //Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: articles.length,
      pagination,
      data: articles
    });
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get single article
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    //Increment view count
    article.views += 1;
    await article.save();
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error('Get article error:', err);
    
    //Check if the error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get article by slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    //Increment view count
    article.views += 1;
    await article.save();
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error('Get article by slug error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Create article
exports.createArticle = async (req, res) => {
  try {
    //Add author to request body
    req.body.author = req.user.username;
    
    //Create article
    const article = await Article.create(req.body);
    
    res.status(201).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Update article
exports.updateArticle = async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    //Make sure user is article author or admin
    if (article.author !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }
    
    //Update the updatedAt field
    req.body.updatedAt = Date.now();
    
    //Update article
    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    //Make sure user is article author or admin
    if (article.author !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }
    
    //Check if article has a featured image and delete it
    if (article.featuredImage && article.featuredImage !== 'default-article.jpg') {
      const imagePath = path.join(__dirname, '../public/uploads/articles', article.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await article.remove();
    
    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Upload article image
exports.uploadArticleImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    const file = req.files.image;
    
    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD || file.size > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image less than 1MB'
      });
    }
    
    //Create custom filename
    file.name = `article_${req.params.id}${path.parse(file.name).ext}`;
    
    //Move file to uploads folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/articles/${file.name}`, async err => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'Problem with file upload'
        });
      }
      
      //Update article with image
      await Article.findByIdAndUpdate(req.params.id, { featuredImage: file.name });
      
      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    console.error('Upload article image error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get featured articles
exports.getFeaturedArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 3;
    
    const articles = await Article.find({ 
      featured: true,
      status: 'published'
    })
    .sort('-createdAt')
    .limit(limit);
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    console.error('Get featured articles error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get articles by category
exports.getArticlesByCategory = async (req, res) => {
  try {
    const articles = await Article.find({
      category: req.params.category,
      status: 'published'
    })
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    console.error('Get articles by category error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Search articles
exports.searchArticles = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    const articles = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ],
      status: 'published'
    })
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    console.error('Search articles error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
const Merchandise = require('../models/Merchandise');
const path = require('path');
const fs = require('fs');

//Get all merchandise
exports.getMerchandise = async (req, res) => {
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
    query = Merchandise.find(JSON.parse(queryStr));
    
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
    const total = await Merchandise.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    //Execute query
    const merchandise = await query;
    
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
      count: merchandise.length,
      pagination,
      data: merchandise
    });
  } catch (err) {
    console.error('Get merchandise error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get single merchandise item
exports.getMerchandiseItem = async (req, res) => {
  try {
    const item = await Merchandise.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Get merchandise item error:', err);
    
    //Check if the error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Merchandise item not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get merchandise item by slug
exports.getMerchandiseBySlug = async (req, res) => {
  try {
    const item = await Merchandise.findOne({ slug: req.params.slug });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Get merchandise by slug error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Create merchandise item
exports.createMerchandiseItem = async (req, res) => {
  try {
    //Create merchandise item
    const item = await Merchandise.create(req.body);
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Create merchandise item error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Update merchandise item
exports.updateMerchandiseItem = async (req, res) => {
  try {
    let item = await Merchandise.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise item not found'
      });
    }
    
    //Update the updatedAt field
    req.body.updatedAt = Date.now();
    
    //Update merchandise item
    item = await Merchandise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Update merchandise item error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Delete merchandise item
exports.deleteMerchandiseItem = async (req, res) => {
  try {
    const item = await Merchandise.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise item not found'
      });
    }
    
    //Check if merchandise has an image and delete it
    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '../public/uploads/merchandise', path.basename(item.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await item.remove();
    
    res.status(200).json({
      success: true,
      message: 'Merchandise item deleted successfully'
    });
  } catch (err) {
    console.error('Delete merchandise item error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Upload merchandise image
exports.uploadMerchandiseImage = async (req, res) => {
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
    file.name = `merchandise_${req.params.id}${path.parse(file.name).ext}`;
    
    //Move file to uploads folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/merchandise/${file.name}`, async err => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'Problem with file upload'
        });
      }
      
      //Update merchandise with image URL
      const imageUrl = `/uploads/merchandise/${file.name}`;
      await Merchandise.findByIdAndUpdate(req.params.id, { imageUrl });
      
      res.status(200).json({
        success: true,
        data: imageUrl
      });
    });
  } catch (err) {
    console.error('Upload merchandise image error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get featured merchandise
exports.getFeaturedMerchandise = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 4;
    
    const merchandise = await Merchandise.find({ featured: true })
      .sort('-createdAt')
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: merchandise.length,
      data: merchandise
    });
  } catch (err) {
    console.error('Get featured merchandise error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get merchandise by category
exports.getMerchandiseByCategory = async (req, res) => {
  try {
    const merchandise = await Merchandise.find({
      category: req.params.category
    })
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: merchandise.length,
      data: merchandise
    });
  } catch (err) {
    console.error('Get merchandise by category error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Search merchandise
exports.searchMerchandise = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    const merchandise = await Merchandise.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: merchandise.length,
      data: merchandise
    });
  } catch (err) {
    console.error('Search merchandise error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
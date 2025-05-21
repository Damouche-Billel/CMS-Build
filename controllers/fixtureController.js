const Fixture = require('../models/Fixture');

//Get all fixtures
exports.getFixtures = async (req, res) => {
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
    query = Fixture.find(JSON.parse(queryStr));
    
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
      query = query.sort('date');
    }
    
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Fixture.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    //Execute query
    const fixtures = await query;
    
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
      count: fixtures.length,
      pagination,
      data: fixtures
    });
  } catch (err) {
    console.error('Get fixtures error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get single fixture
exports.getFixture = async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id);
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: fixture
    });
  } catch (err) {
    console.error('Get fixture error:', err);
    
    //Check if the error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Create fixture
exports.createFixture = async (req, res) => {
  try {
    const { opponent, location, date, time, competition, tickets, result } = req.body;

    //Validate date and time
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Date and time are required.' });
    }

    //Extra validation for format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ success: false, message: 'Date must be YYYY-MM-DD and time must be HH:mm.' });
    }

    //Combine date and time into a single ISO string
    const isoDateTime = `${date}T${time}`;
    console.log('Received date:', date, 'time:', time, 'isoDateTime:', isoDateTime);
    const fixtureDate = new Date(isoDateTime);

    if (isNaN(fixtureDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date or time format.' });
    }

    //Build homeTeam and awayTeam objects
    let homeTeam, awayTeam;
    if (location === 'home') {
      homeTeam = { name: 'Fennec FC', logo: '/assets/images/brand-logo.png' };
      awayTeam = { name: opponent, logo: '' };
    } else if (location === 'away') {
      homeTeam = { name: opponent, logo: '' };
      awayTeam = { name: 'Fennec FC', logo: '/assets/images/brand-logo.png' };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid location' });
    }

    //Compose fixture data
    const fixtureData = {
      date: fixtureDate,
      homeTeam,
      awayTeam,
      competition,
      status: result && result.status ? result.status : 'upcoming',
      result: {
        homeScore: result && typeof result.homeScore === 'number' ? result.homeScore : null,
        awayScore: result && typeof result.awayScore === 'number' ? result.awayScore : null,
        status: result && result.status ? result.status : 'upcoming'
      },
      tickets
    };

    const fixture = await Fixture.create(fixtureData);

    res.status(201).json({
      success: true,
      data: fixture
    });
  } catch (err) {
    console.error('Create fixture error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

//Update fixture
exports.updateFixture = async (req, res) => {
  try {
    let fixture = await Fixture.findById(req.params.id);
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    //Update the updatedAt field
    req.body.updatedAt = Date.now();
    
    //Update fixture
    fixture = await Fixture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: fixture
    });
  } catch (err) {
    console.error('Update fixture error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Delete fixture
exports.deleteFixture = async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id);
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    await fixture.remove();
    
    res.status(200).json({
      success: true,
      message: 'Fixture deleted successfully'
    });
  } catch (err) {
    console.error('Delete fixture error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get upcoming fixtures
exports.getUpcomingFixtures = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const fixtures = await Fixture.find({
      'result.status': 'upcoming',
      date: { $gte: new Date() }
    })
    .sort('date')
    .limit(limit);
    
    res.status(200).json({
      success: true,
      count: fixtures.length,
      data: fixtures
    });
  } catch (err) {
    console.error('Get upcoming fixtures error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Get recent results
exports.getRecentResults = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10; //Show more by default

    //Fetch all fixtures in the past (date <= now), regardless of result.status,
    //but show completed results first, then others (postponed/cancelled), most recent first
    const now = new Date();
    const fixtures = await Fixture.find({
      date: { $lte: now }
    })
      .sort([
        //Sort completed first, then by date descending
        ['result.status', 1], //completed < postponed < cancelled < undefined
        ['date', -1]
      ])
      .limit(limit);

    res.status(200).json({
      success: true,
      count: fixtures.length,
      data: fixtures
    });
  } catch (err) {
    console.error('Get recent results error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Update fixture result
exports.updateFixtureResult = async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id);
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }
    
    //Update only the result field
    fixture.result = req.body.result;
    fixture.updatedAt = Date.now();
    
    await fixture.save();
    
    res.status(200).json({
      success: true,
      data: fixture
    });
  } catch (err) {
    console.error('Update fixture result error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
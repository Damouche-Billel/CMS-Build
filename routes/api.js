const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

//Dashboard statistics route
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const Article = require('../models/Article');
    const Merchandise = require('../models/Merchandise');
    const Fixture = require('../models/Fixture');
    const User = require('../models/User');

    //Count documents
    const articlesCount = await Article.countDocuments();
    const upcomingFixturesCount = await Fixture.countDocuments({
      'result.status': 'upcoming'
    });
    const merchandiseCount = await Merchandise.countDocuments();
    const usersCount = await User.countDocuments();

    //Articles statistics
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const archivedArticles = await Article.countDocuments({ status: 'archived' });

    //Recent articles
    const recentArticles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author status createdAt');

    //Recent merchandise
    const recentMerchandise = await Merchandise.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock createdAt');

    //Upcoming fixtures
    const upcomingFixtures = await Fixture.find({
      'result.status': 'upcoming',
      date: { $gte: new Date() }
    })
    .sort('date')
    .limit(5);

    //Recent results
    const recentResults = await Fixture.find({
      'result.status': 'completed'
    })
    .sort('-date')
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          articles: articlesCount,
          upcomingFixtures: upcomingFixturesCount,
          merchandise: merchandiseCount,
          users: usersCount
        },
        articles: {
          published: publishedArticles,
          draft: draftArticles,
          archived: archivedArticles
        },
        recent: {
          articles: recentArticles,
          merchandise: recentMerchandise,
          upcomingFixtures: upcomingFixtures,
          recentResults: recentResults
        }
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Article = require('./models/Article');
const Merchandise = require('./models/Merchandise');
const Fixture = require('./models/Fixture');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/fennecFC', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@fennecfc.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'editor',
    email: 'editor@fennecfc.com',
    password: 'password123',
    role: 'editor',
    isVerified: true
  }
];

const articles = [
  {
    title: 'Team Signs New Forward',
    category: 'Team News',
    content: `
      <p>Fennec FC is delighted to announce the signing of new forward player Alex Johnson for the upcoming season.</p>
      
      <p>Johnson, 24, joins us from City Rovers where he scored 15 goals in 28 appearances last season. The talented striker brings a wealth of experience and goal-scoring ability that will significantly strengthen our attacking options.</p>
      
      <p>"I'm thrilled to join Fennec FC and can't wait to meet the fans and my new teammates," said Johnson. "The club has big ambitions, and I'm excited to be part of the journey ahead."</p>
      
      <p>Manager David Williams expressed his satisfaction with the new signing: "Alex is a proven goal-scorer with excellent movement and finishing ability. He's exactly the type of player we've been looking for to complete our forward line."</p>
      
      <p>Johnson will wear the number 9 shirt and is expected to make his debut in next week's friendly match against United FC.</p>
    `,
    author: 'admin',
    status: 'published',
    featured: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    title: 'Match Report: Fennec FC vs. City Rovers',
    category: 'Match Reports',
    content: `
      <h3>Fennec FC 3-2 City Rovers: Thrilling Victory for The Foxes</h3>
      
      <p>Fennec FC secured a dramatic 3-2 victory over City Rovers in yesterday's league clash at Fox Stadium, with a last-minute winner from captain Michael Roberts.</p>
      
      <p>The match started brightly for the home side, with Thomas Wilson opening the scoring in the 12th minute with a powerful header from James Peterson's perfectly weighted cross.</p>
      
      <p>City Rovers equalized in the 34th minute through their striker Sam Thompson, who capitalized on a defensive error to slot past our goalkeeper David Lewis.</p>
      
      <p>The second half saw Fennec FC regain the lead in the 58th minute when James Peterson converted a penalty after being fouled in the box. However, the visitors responded quickly, with Ryan Garcia scoring from a free-kick in the 67th minute to make it 2-2.</p>
      
      <p>Just when it seemed the points would be shared, captain Michael Roberts stepped up in the 89th minute to volley home a brilliant winner from the edge of the box, sending the home crowd into wild celebrations.</p>
      
      <p>Manager David Williams praised the team's resilience: "It wasn't our most polished performance, but the players showed great character to find a way to win. That's what champions do."</p>
      
      <p>The victory puts Fennec FC three points clear at the top of the league table with five games remaining in the season.</p>
    `,
    author: 'admin',
    status: 'published',
    featured: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    title: 'Coach Interview: Season Preview',
    category: 'Interviews',
    content: `
      <h3>Exclusive Interview with Head Coach David Williams</h3>
      
      <p>As the new season approaches, we sat down with Fennec FC Head Coach David Williams to discuss the team's preparations, new signings, and expectations for the upcoming campaign.</p>
      
      <p><strong>Q: How have pre-season preparations been going?</strong></p>
      
      <p>A: The preparations have been excellent. The players have returned in good shape, and we've had a productive training camp. The new signings are integrating well with the squad, and there's a positive atmosphere within the group.</p>
      
      <p><strong>Q: What are your thoughts on the new additions to the squad?</strong></p>
      
      <p>A: We've made some strategic signings to strengthen specific areas of the team. Alex Johnson adds firepower to our attack, while defensive midfielder Carlos Mendez brings experience and leadership to our midfield. Young goalkeeper Tim Harris is a promising talent for the future.</p>
      
      <p><strong>Q: What are your expectations for the upcoming season?</strong></p>
      
      <p>A: We want to build on last season's fourth-place finish. Our primary goal is to qualify for Continental competition, but we also want to make a deep run in the Cup. This squad has the talent and depth to compete on multiple fronts.</p>
      
      <p><strong>Q: Any specific areas you're focusing on improving from last season?</strong></p>
      
      <p>A: We conceded too many goals from set-pieces last season, so we've been working extensively on defensive organization. We've also been focusing on our attacking transitions to become more clinical on the counter-attack.</p>
      
      <p><strong>Q: Finally, what message do you have for the fans?</strong></p>
      
      <p>A: I want to thank them for their unwavering support. They were our 12th player last season, and we'll need them again this year. We're committed to playing attractive, winning football that makes them proud to support Fennec FC.</p>
    `,
    author: 'editor',
    status: 'draft',
    featured: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    title: 'Community Day Event Announced',
    category: 'Community',
    content: `
      <h3>Fennec FC Community Day: Come Meet Your Heroes!</h3>
      
      <p>Fennec FC is delighted to announce our annual Community Day event, scheduled for Saturday, June 15th at the Fox Stadium training grounds.</p>
      
      <p>This family-friendly day offers fans of all ages the opportunity to meet players, participate in fun activities, and enjoy a day of football-related entertainment.</p>
      
      <h4>Event Highlights:</h4>
      
      <ul>
        <li>Meet and greet with the entire first-team squad</li>
        <li>Autograph sessions and photo opportunities</li>
        <li>Skills challenges and mini-games</li>
        <li>Stadium tours</li>
        <li>Face painting and activities for young fans</li>
        <li>Food stalls and refreshments</li>
        <li>Exclusive merchandise discounts</li>
      </ul>
      
      <p>"Community Day is one of our favorite events of the year," said Club Director Sarah Thompson. "It's a fantastic opportunity for us to give back to our supporters and strengthen the bond between the club and our community."</p>
      
      <p>Entry to the event is free for season ticket holders, while general admission tickets are priced at £5 for adults and £2 for children under 16. All proceeds will go to the Fennec FC Foundation, which supports various community initiatives.</p>
      
      <p>Tickets can be purchased online through our official website or at the stadium ticket office.</p>
      
      <p>We look forward to seeing you there!</p>
    `,
    author: 'admin',
    status: 'published',
    featured: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  },
  {
    title: 'End of Season Party Details',
    category: 'Team News',
    content: `
      <h3>End of Season Celebration: Join Us to Celebrate a Successful Season!</h3>
      
      <p>As the current season draws to a close, Fennec FC invites all supporters to our End of Season Celebration Party on Saturday, May 25th at the Grand Hotel Ballroom.</p>
      
      <p>This special evening will be a chance to celebrate the team's achievements, honor standout performers, and thank our amazing fans for their support throughout the season.</p>
      
      <h4>Event Details:</h4>
      
      <ul>
        <li><strong>Date:</strong> Saturday, May 25th, 2025</li>
        <li><strong>Time:</strong> 7:00 PM - 11:30 PM</li>
        <li><strong>Venue:</strong> Grand Hotel Ballroom</li>
        <li><strong>Dress Code:</strong> Smart Casual</li>
      </ul>
      
      <h4>The evening will include:</h4>
      
      <ul>
        <li>Three-course dinner</li>
        <li>Player Awards Ceremony</li>
        <li>Speeches from the manager and captain</li>
        <li>Charity auction with exclusive club memorabilia</li>
        <li>Live entertainment and dancing</li>
      </ul>
      
      <p>Tickets are priced at £75 per person, with tables of 10 available for £700. Each ticket includes the dinner, a welcome drink, and entry to the after-party.</p>
      
      <p>Season ticket holders can purchase tickets at a discounted rate of £65 per person. Tickets can be bought online through our official website or at the stadium ticket office.</p>
      
      <p>Don't miss this opportunity to celebrate with the team and fellow supporters!</p>
    `,
    author: 'admin',
    status: 'archived',
    featured: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  }
];

const merchandise = [
  {
    name: 'Home Jersey 2025',
    price: 69.99,
    description: `
      <p>The official Fennec FC home jersey for the 2025 season. Show your support for The Foxes with this stylish and comfortable jersey.</p>
      
      <h4>Features:</h4>
      <ul>
        <li>Breathable lightweight fabric</li>
        <li>Moisture-wicking technology</li>
        <li>Embroidered club crest</li>
        <li>Sponsor logo on front</li>
        <li>100% polyester</li>
        <li>Machine washable</li>
      </ul>
      
      <p>Available in sizes S, M, L, XL, and XXL. For youth sizes, please check our Junior Collection.</p>
    `,
    category: 'Jerseys',
    imageUrl: '/uploads/merchandise/home-jersey.jpg',
    stock: 100,
    featured: true
  },
  {
    name: 'Away Jersey 2025',
    price: 69.99,
    description: `
      <p>The official Fennec FC away jersey for the 2025 season. Support The Foxes on their travels with this stylish and comfortable jersey.</p>
      
      <h4>Features:</h4>
      <ul>
        <li>Breathable lightweight fabric</li>
        <li>Moisture-wicking technology</li>
        <li>Embroidered club crest</li>
        <li>Sponsor logo on front</li>
        <li>100% polyester</li>
        <li>Machine washable</li>
      </ul>
      
      <p>Available in sizes S, M, L, XL, and XXL. For youth sizes, please check our Junior Collection.</p>
    `,
    category: 'Jerseys',
    imageUrl: '/uploads/merchandise/away-jersey.jpg',
    stock: 85,
    featured: true
  },
  {
    name: 'Training Jacket',
    price: 49.99,
    description: `
      <p>The official Fennec FC training jacket, as worn by the players during training sessions. Perfect for staying warm during workouts or casual wear.</p>
      
      <h4>Features:</h4>
      <ul>
        <li>Water-resistant material</li>
        <li>Full zip front</li>
        <li>Side pockets</li>
        <li>Embroidered club crest</li>
        <li>Sponsor logo on back</li>
        <li>85% polyester, 15% elastane</li>
        <li>Machine washable</li>
      </ul>
      
      <p>Available in sizes S, M, L, XL, and XXL.</p>
    `,
    category: 'Apparel',
    imageUrl: '/uploads/merchandise/training-jacket.jpg',
    stock: 65,
    featured: false
  },
  {
    name: 'Fennec FC Scarf',
    price: 19.99,
    description: `
      <p>Show your support for The Foxes with the official Fennec FC scarf. Perfect for match days and staying warm during the colder months.</p>
      
      <h4>Features:</h4>
      <ul>
        <li>Club colors design</li>
        <li>Embroidered club crest</li>
        <li>Soft acrylic material</li>
        <li>Length: 150cm</li>
        <li>Width: 20cm</li>
      </ul>
      
      <p>One size fits all.</p>
    `,
    category: 'Accessories',
    imageUrl: '/uploads/merchandise/scarf.jpg',
    stock: 120,
    featured: true
  },
  {
    name: 'Fennec FC Mug',
    price: 12.99,
    description: `
      <p>Start your day with a cup of coffee or tea in the official Fennec FC mug. A perfect gift for any Fox supporter.</p>
      
      <h4>Features:</h4>
      <ul>
        <li>Ceramic material</li>
        <li>Club crest print</li>
        <li>Capacity: 330ml</li>
        <li>Dishwasher and microwave safe</li>
      </ul>
    `,
    category: 'Accessories',
    imageUrl: '/uploads/merchandise/mug.jpg',
    stock: 200,
    featured: false
  }
];

const fixtures = [
  {
    opponent: 'City Rovers',
    location: 'home',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    time: '15:00',
    competition: 'League',
    result: {
      homeScore: 3,
      awayScore: 2,
      status: 'completed'
    },
    tickets: {
      available: false,
      url: ''
    }
  },
  {
    opponent: 'United FC',
    location: 'away',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    time: '19:45',
    competition: 'League',
    result: {
      homeScore: 1,
      awayScore: 1,
      status: 'completed'
    },
    tickets: {
      available: false,
      url: ''
    }
  },
  {
    opponent: 'Athletic Club',
    location: 'home',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '15:00',
    competition: 'League',
    result: {
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    },
    tickets: {
      available: true,
      url: '/tickets/purchase?match=athletic'
    }
  },
  {
    opponent: 'Metro Stars',
    location: 'away',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    time: '19:45',
    competition: 'Cup',
    result: {
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    },
    tickets: {
      available: true,
      url: '/tickets/purchase?match=metro'
    }
  },
  {
    opponent: 'Riverside FC',
    location: 'home',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    time: '15:00',
    competition: 'League',
    result: {
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    },
    tickets: {
      available: false,
      url: ''
    }
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Article.deleteMany();
    await Merchandise.deleteMany();
    await Fixture.deleteMany();
    
    console.log('Data cleared...');
    
    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );
    
    await User.create(hashedUsers);
    console.log('Users imported...');
    
    // Create articles
    await Article.create(articles);
    console.log('Articles imported...');
    
    // Create merchandise
    await Merchandise.create(merchandise);
    console.log('Merchandise imported...');
    
    // Create fixtures
    await Fixture.create(fixtures);
    console.log('Fixtures imported...');
    
    console.log('Data import complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Article.deleteMany();
    await Merchandise.deleteMany();
    await Fixture.deleteMany();
    
    console.log('Data destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please add proper flag: -i to import or -d to delete');
  process.exit();
}
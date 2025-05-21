# Fennec FC Content Management System

A robust back-end focused content management system for Fennec FC, built with Node.js, Express, and MongoDB. This system enables secure content management for news articles, fixtures, merchandise, and user administration.

👉 [View Project on GitHub](https://github.com/BillyLangdown/Fennec-FC-CMS)

## Features

### Authentication & Security
- Secure user authentication with role-based access (Admin/Editor)
- Email verification using Ethereal/Nodemailer for testing
- Password hashing with bcrypt
- Session management with express-session
- Protected API routes with middleware

### Content Management
- **News Articles:** CRUD operations with rich text editing
- **Fixtures:** Match scheduling and result management
- **Merchandise:** Product catalog with image upload
- **User Management:** Admin-only user control

### Technical Features
- RESTful API architecture
- MongoDB/Mongoose for data modeling
- File upload handling
- Error handling and validation
- Pagination and filtering
- Search functionality

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- express-session for authentication
- bcryptjs for password hashing
- Nodemailer for email handling

### Frontend
- HTML5 & CSS3
- Vanilla JavaScript (ES6+)
- Responsive design
- Custom CSS architecture

### Security
- Password hashing
- Session management
- Protected routes
- Input validation
- XSS protection

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/BillyLangdown/Fennec-FC-CMS.git
cd Fennec-FC-CMS
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file:
```env
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
```

4. **Start the server:**
```bash
npm start
```

## API Documentation

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset

### Content Routes
- `GET /api/articles` - Get all articles
- `GET /api/fixtures` - Get all fixtures
- `GET /api/merchandise` - Get all merchandise

### Admin Routes
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:id` - Update user (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)

## Testing

### Email Testing
The system uses Ethereal for email testing in development:
1. Register a new user
2. Check the console for the Ethereal preview URL
3. Open the URL to view the test email

## Security Measures

- Password hashing with bcrypt
- Session-based authentication
- Protected API routes
- Input sanitization
- File upload validation
- Role-based access control

## Project Structure

```
fennec-fc-cms/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── public/         # Static files
├── routes/         # API routes
├── utils/          # Helper functions
└── server.js       # Entry point
```

## Learning Outcomes Demonstrated

- ✅ Secure user authentication implementation
- ✅ RESTful API design
- ✅ Database modeling and management
- ✅ File handling and validation
- ✅ Error handling and logging
- ✅ Security best practices

## Future Enhancements

- Real-time updates with WebSocket
- Advanced caching mechanisms
- API rate limiting
- Enhanced analytics dashboard

## Author
Billy Langdown

## License
This project is licensed under the MIT License

---

[View the live project](https://your-deployment-url.com)  
[View on GitHub](https://github.com/BillyLangdown/Fennec-FC-CMS)
# Fennec FC Content Management System (CMS)

A robust, secure, and user-friendly Content Management System for Fennec FC, built with Node.js, Express, and MongoDB. This CMS enables authorized users to manage news articles, fixtures, merchandise, and user accounts, supporting both admin and editor roles.

---

## Project Overview

The Fennec FC CMS is designed to streamline the management of football club content, providing:

- **Role-based authentication** (Admin/Editor)
- **News article management** (CRUD, categories, status)
- **Fixture scheduling and results**
- **Merchandise catalog management**
- **User administration** (admin only)
- **Secure session management**
- **Email verification and password reset**
- **RESTful API architecture**
- **Responsive, accessible dashboard UI**

---

## Features

### Authentication & Security
- Secure login, registration, and session management
- Role-based access (admin/editor)
- Email verification (AWS SES)
- Password hashing (bcryptjs)
- Protected API routes and input validation

### Content Management
- **News:** CRUD, categories, status (published/draft/archived), featured images
- **Fixtures:** Add/edit fixtures, update results, ticket info
- **Merchandise:** Product catalog, image upload, featured flag, stock management
- **Users:** Admin-only user management (add/edit/delete users, assign roles)

### Technical Features
- RESTful API (Express)
- MongoDB/Mongoose for data modeling
- File upload handling (express-fileupload)
- Pagination, filtering, and search
- Error handling and validation

---

## Database Schema

### User

| Field                | Type      | Description                        |
|----------------------|-----------|------------------------------------|
| username             | String    | Unique, required                   |
| email                | String    | Unique, required, validated        |
| password             | String    | Hashed, required                   |
| role                 | String    | 'admin' or 'editor'                |
| isVerified           | Boolean   | Email verified status              |
| verificationToken    | String    | For email verification             |
| resetPasswordToken   | String    | For password reset                 |
| resetPasswordExpire  | Date      | Password reset expiry              |
| dateCreated          | Date      | Account creation date              |

### Article

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| title         | String    | Required, max 100 chars            |
| slug          | String    | URL-friendly, unique               |
| category      | String    | Enum: Team News, Match Reports, etc|
| content       | String    | Main article body                  |
| author        | String    | Username of creator                |
| status        | String    | published/draft/archived           |
| featured      | Boolean   | Featured article flag              |
| featuredImage | String    | Image URL                          |
| views         | Number    | View count                         |
| createdAt     | Date      | Creation date                      |
| updatedAt     | Date      | Last update                        |

### Fixture

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| date          | Date      | Match date/time                    |
| homeTeam      | Object    | { name, logo }                     |
| awayTeam      | Object    | { name, logo }                     |
| competition   | String    | Competition name                   |
| status        | String    | upcoming/completed/postponed       |
| result        | Object    | { homeScore, awayScore, status }   |
| tickets       | Object    | { available, url }                 |
| createdAt     | Date      | Creation date                      |
| updatedAt     | Date      | Last update                        |

### Merchandise

| Field         | Type      | Description                        |
|---------------|-----------|------------------------------------|
| name          | String    | Product name                       |
| slug          | String    | URL-friendly, unique               |
| price         | Number    | Product price                      |
| description   | String    | Product description                |
| imageUrl      | String    | Image URL                          |
| category      | String    | Enum: Jerseys, Apparel, etc.       |
| stock         | Number    | Stock quantity                     |
| featured      | Boolean   | Featured product flag              |
| createdAt     | Date      | Creation date                      |
| updatedAt     | Date      | Last update                        |

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Damouche-Billel/University-Assignment-4FSC0WE004.git
   cd "CMS Development"
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
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=your_aws_ses_user
   EMAIL_PASS=your_aws_ses_pass
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

---

## API Endpoints

- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login
- `GET /api/auth/logout` – Logout
- `GET /api/auth/users` – List users (admin only)
- `GET /api/articles` – List articles
- `GET /api/fixtures` – List fixtures
- `GET /api/merchandise` – List merchandise

---

## Security Measures

- Password hashing (bcryptjs)
- Session-based authentication
- Role-based access control
- Input validation and sanitization
- File upload validation

---

## Project Structure

```
fennec-fc-cms/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── public/         # Static files (HTML, CSS, JS)
├── routes/         # API routes
├── utils/          # Helper functions
└── server.js       # Entry point
```

---

## Hosting

- **Live Demo:** [https://billel-university.com](https://billel-university.com)
- **GitHub Repository:** [https://github.com/Damouche-Billel/University-Assignment-4FSC0WE004/tree/main/CMS%20Development](https://github.com/Damouche-Billel/University-Assignment-4FSC0WE004/tree/main/CMS%20Development)


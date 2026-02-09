# BookShelf - Full-Stack Book Review Platform

Full-stack web application built with Express.js, MongoDB, and vanilla JavaScript. Users can browse books, write reviews, and rate their favorites. Admins manage the book catalog while authenticated users can contribute reviews.

**Live URL:** https://web2-final-j7dj.onrender.com

**GitHub:** https://github.com/desobei/web2-final

**Postman Collection:** included in the repository as `BookShelf_API.postman_collection.json`

## Project Overview

### Relational Data Model

- **Users** — Register, login, JWT auth, roles (user/admin)
- **Books** — CRUD by admins, searchable/filterable, linked to creator via `createdBy`
- **Reviews** — Linked to both `Book` and `User` via ObjectId references, one review per user per book, auto-computed average ratings

## Technology Stack

- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Frontend**: HTML, CSS, JavaScript (Vanilla, served as static files)
- **Deployment**: Render (single-service)

## Project Structure

```
├── server.js                 # Entry point
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register, login, getMe
│   ├── bookController.js     # Books CRUD + search/filter
│   └── reviewController.js   # Reviews CRUD + rating aggregation
├── middleware/
│   ├── auth.js               # JWT protect + admin RBAC
│   └── errorHandlers.js      # 404 & error handler
├── models/
│   ├── Book.js               # Book schema (refs User)
│   ├── Review.js             # Review schema (refs Book + User)
│   └── User.js               # User schema with bcrypt
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── bookRoutes.js         # Book endpoints
│   └── reviewRoutes.js       # Review endpoints
├── utils/
│   └── asyncHandler.js       # Async error wrapper
├── public/
│   └── index.html            # Full SPA frontend
├── .env                      # Environment variables (not committed)
├── .gitignore
└── package.json
```

## Running Locally

Requires Node.js v18+ and a MongoDB connection.

```bash
git clone https://github.com/desobei/web2-final.git
cd web2-final
npm install
```

Create a `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookshelf
JWT_SECRET=your_secret_key
PORT=4000
NODE_ENV=development
```

Start the server:

```bash
npm start
```

Open http://localhost:4000

To seed sample data (10 books, 2 users, 1 review):

```bash
node seed.js
```

## API Endpoints

### Authentication

| Method | Endpoint             | Access  | Description      |
| ------ | -------------------- | ------- | ---------------- |
| POST   | `/api/auth/register` | Public  | Register user    |
| POST   | `/api/auth/login`    | Public  | Login, get JWT   |
| GET    | `/api/auth/me`       | Private | Get current user |

### Books

| Method | Endpoint                 | Access     | Description                     |
| ------ | ------------------------ | ---------- | ------------------------------- |
| GET    | `/api/books`             | Public     | List all (search, filter, sort) |
| GET    | `/api/books/:id`         | Public     | Get single book                 |
| GET    | `/api/books/:id/reviews` | Public     | Get reviews for a book          |
| POST   | `/api/books`             | Admin Only | Create book                     |
| PUT    | `/api/books/:id`         | Admin Only | Update book                     |
| DELETE | `/api/books/:id`         | Admin Only | Delete book + its reviews       |

**Query Parameters:** `?search=gatsby&genre=Fiction&sort=rating|title|year`

### Reviews

| Method | Endpoint           | Access         | Description       |
| ------ | ------------------ | -------------- | ----------------- |
| GET    | `/api/reviews`     | Public         | List all reviews  |
| GET    | `/api/reviews/:id` | Public         | Get single review |
| POST   | `/api/reviews`     | Authenticated  | Create review     |
| PUT    | `/api/reviews/:id` | Owner or Admin | Update review     |
| DELETE | `/api/reviews/:id` | Owner or Admin | Delete review     |

## Authentication & Authorization

### RBAC (Role-Based Access Control)

| Role      | Permissions                                                |
| --------- | ---------------------------------------------------------- |
| **Guest** | Browse books and reviews (GET only)                        |
| **User**  | Everything a guest can do + create/edit/delete own reviews |
| **Admin** | Full access: manage books + manage all reviews             |

### How It Works

1. **Registration/Login** returns a JWT token (valid 30 days)
2. Frontend stores token in `localStorage`
3. Token sent as `Authorization: Bearer <token>` header
4. `protect` middleware verifies JWT and attaches user to request
5. `admin` middleware checks `req.user.role === 'admin'`
6. Review ownership checked in controller (`review.user === req.user._id`)

### Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT secret stored in environment variable
- Password excluded from query results by default (`select: false`)
- Input validation on all POST/PUT routes via express-validator

## Frontend Features

Single-page application served from `public/index.html`:

- **Tab-based navigation**: Books, Reviews, Admin (admin only), Profile
- **Auth modals**: Login / Register with form validation
- **Book cards**: Grid layout with ratings, genre badges, clickable for detail view
- **Book detail**: Full info + all reviews for that book inline
- **Star picker**: Interactive rating selector for reviews
- **Admin panel**: Add, edit, delete books from a management interface
- **Profile page**: View account info and personal reviews
- **Search & filter**: Real-time search by title/author, filter by genre, sort by rating/year/title
- **Responsive design**: Works on mobile, tablet, desktop via CSS Grid + media queries

## Deployment

The application is deployed on Render as a single service. The frontend is served as static files from Express, so both backend and frontend run together.

Live at: https://web2-final-j7dj.onrender.com

## Author

Abylaikhan

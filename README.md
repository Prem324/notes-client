# MERN Notes App

A full-stack notes management application built with the MERN stack. Users can register, log in, create and manage notes, add comments, upload attachments, update profile pictures, and receive real-time comment updates using Socket.IO.

![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-blue)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%7C%20Jest-yellow)

---

## Live Demo

Frontend: `https://your-frontend-url.vercel.app`
Backend API: `https://your-backend-url.onrender.com`

> Note: The backend may be hosted on Render Free Tier, so the first request after inactivity can take a few seconds because of cold start.

---

## Overview

This project is a production-style MERN Notes application with authentication, protected routes, CRUD operations, comments, file uploads, profile picture management, real-time updates, testing, and deployment configuration.

The app demonstrates full-stack architecture using React on the frontend and Express/MongoDB on the backend. Media files are stored on Cloudinary, authentication is handled using JWT, and real-time comment updates are powered by Socket.IO.

---

## Features

* User registration and login with JWT authentication
* Protected frontend routes for authenticated users
* Create, read, update, and delete notes
* Search notes by title or content with debounced search
* Mark notes as completed or pending
* Add comments to notes
* Real-time comment updates using Socket.IO
* Upload and delete note attachments
* Upload, replace, and delete profile picture
* Image validation and preview on frontend
* Image compression before upload using Sharp
* Cloudinary media storage
* Centralized backend error handling
* Frontend and backend form validation
* Axios interceptor for JWT authorization
* Responsive UI
* Frontend testing with Vitest and React Testing Library
* Backend testing with Jest and Supertest
* Deployment-ready frontend and backend configuration

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* Vitest
* React Testing Library
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Joi
* Multer
* Sharp
* Cloudinary
* Socket.IO
* Jest
* Supertest

### Deployment

* Frontend: Vercel / Netlify
* Backend: Render
* Database: MongoDB Atlas
* Media Storage: Cloudinary

---

## Architecture

React components handle the user interface and call feature-based service files. Axios is configured with a base URL and JWT request interceptor. Requests go to Express routes, pass through authentication and validation middleware, then reach controllers and service-layer functions.

MongoDB stores users, notes, comments, and media metadata, while Cloudinary stores uploaded files. Socket.IO is used for real-time comment updates.

```txt
React UI
↓
Reusable Components
↓
Pages
↓
Feature Services
↓
Axios Instance
↓
Express Routes
↓
Middleware
↓
Controllers
↓
Services
↓
MongoDB / Cloudinary / Socket.IO
```

---

## Folder Structure

```txt
mern-notes-project/
│
├── notes-client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── notes/
│   │   │   ├── comments/
│   │   │   ├── attachments/
│   │   │   └── profile/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── notes/
│   │   │   ├── comments/
│   │   │   └── profile/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── test/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── notes-server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Environment Variables

Create `.env` files for both backend and frontend.

Do not commit real `.env` files to GitHub. Use `.env.example` to document required variables.

---

### Backend `.env`

Create this file inside `notes-server/`.

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:5173
```

For production, `FRONTEND_URL` should be your deployed frontend URL.

Example:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

### Frontend `.env`

Create this file inside `notes-client/`.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

For production:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

Important:

```txt
REST API URL includes /api/v1
Socket URL does not include /api/v1
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mern-notes-app.git
cd mern-notes-app
```

---

### 2. Install backend dependencies

```bash
cd notes-server
npm install
```

---

### 3. Install frontend dependencies

```bash
cd ../notes-client
npm install
```

---

### 4. Configure environment variables

Create `.env` files inside both:

```txt
notes-server/.env
notes-client/.env
```

Use the environment variable examples above.

---

### 5. Run backend

```bash
cd notes-server
npm run dev
```

Backend will run on:

```txt
http://localhost:5000
```

---

### 6. Run frontend

```bash
cd notes-client
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

---

## API Endpoints

Base URL:

```txt
/api/v1
```

---

### Auth

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
```

---

### Notes

```txt
GET    /api/v1/notes
POST   /api/v1/notes
GET    /api/v1/notes/:id
PUT    /api/v1/notes/:id
DELETE /api/v1/notes/:id
POST   /api/v1/notes/:id/attachments
DELETE /api/v1/notes/:id/attachments/:attachmentId
```

---

### Comments

```txt
GET  /api/v1/comments/note/:noteId
POST /api/v1/comments/:noteId
```

---

### Profile

```txt
GET    /api/v1/users/profile
PATCH  /api/v1/users/profile-picture
DELETE /api/v1/users/profile-picture
```

---

## Authentication Flow

```txt
User logs in
↓
Backend validates credentials
↓
Backend returns JWT token
↓
Frontend stores token
↓
Axios interceptor adds Authorization header
↓
Protected backend routes verify token
```

Authorization header format:

```txt
Authorization: Bearer <token>
```

---

## File Upload Flow

### Note Attachments

Frontend sends files using:

```txt
FormData key: attachments
```

Backend receives files using:

```js
upload.array("attachments", 5)
```

Flow:

```txt
AttachmentForm
↓
FormData append("attachments", file)
↓
Axios POST request
↓
Multer reads files
↓
Sharp compresses images
↓
Cloudinary stores files
↓
MongoDB stores metadata
```

---

### Profile Picture

Frontend sends image using:

```txt
FormData key: profilePicture
```

Backend receives image using:

```js
upload.single("profilePicture")
```

Flow:

```txt
ProfileImageForm
↓
FormData append("profilePicture", image)
↓
Axios PATCH request
↓
Multer reads file
↓
Sharp compresses image
↓
Cloudinary stores image
↓
Old image is deleted if it exists
↓
MongoDB user profile is updated
```

---

## Real-Time Comments

Socket.IO is used for real-time comment updates.

Flow:

```txt
User opens note details page
↓
Frontend joins note room
↓
User creates a comment
↓
Backend saves comment
↓
Backend emits comment:created event
↓
Connected clients receive new comment
↓
UI updates without refresh
```

Socket room format:

```txt
note:<noteId>
```

Socket event:

```txt
comment:created
```

---

## Testing

### Backend Tests

Run from `notes-server/`:

```bash
npm test
```

Backend tests include:

* service tests
* controller tests
* middleware tests
* authentication tests
* file upload service tests
* API tests with Jest and Supertest

---

### Frontend Tests

Run from `notes-client/`:

```bash
npm test
```

Frontend tests include:

* common component tests
* form validation tests
* note component tests
* attachment component tests
* profile image form tests
* service tests
* auth utility tests
* Axios interceptor tests
* route guard tests
* custom hook tests

---

## Production Build

Run frontend production build:

```bash
cd notes-client
npm run build
```

Preview production build locally:

```bash
npm run preview
```

---

## Deployment Notes

### Backend on Render

Use Render Web Service.

Recommended settings:

```txt
Runtime: Node
Build Command: npm install
Start Command: npm start
```

If the project is a monorepo:

```txt
Root Directory: notes-server
```

Make sure Render has all backend environment variables.

For better latency from India:

```txt
Render Region: Singapore
MongoDB Atlas Region: AWS ap-southeast-1 / Singapore
```

---

### Frontend on Vercel

Recommended settings:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

If using React Router, add `vercel.json` in the frontend root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This fixes refresh issues for frontend routes like:

```txt
/notes
/profile
/notes/:noteId
```

---

## CORS Configuration

Backend should allow local and deployed frontend origins.

Example:

```js
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

Socket.IO CORS should also allow the frontend URL:

```js
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});
```

---

## Screenshots

Add screenshots inside a `screenshots/` folder.

Recommended:

```txt
screenshots/
  home.png
  login.png
  notes-page.png
  note-details.png
  profile-page.png
```

Example:

```md
## Screenshots

### Notes Page
![Notes Page](./screenshots/notes-page.png)

### Note Details Page
![Note Details Page](./screenshots/note-details.png)

### Profile Page
![Profile Page](./screenshots/profile-page.png)
```

---

## Demo Credentials

Optional. Add only if you create a safe demo user.

```txt
Email: demo@example.com
Password: demo123
```

Do not use real personal accounts or admin credentials.

---

## Known Limitations

* Backend hosted on Render Free Tier may have cold starts after inactivity.
* Authentication currently uses JWT in localStorage.
* httpOnly cookie authentication can be added in the future for stronger production security.
* Pagination API exists, but advanced pagination UI can be improved.
* Admin dashboard is not included yet.
* File upload validation exists on frontend and backend, but more advanced malware scanning can be added in production.

---

## Future Improvements

* Add refresh token authentication with httpOnly cookies
* Add email verification
* Add password reset
* Add note sharing and collaboration
* Add role-based admin dashboard
* Add advanced pagination UI
* Add notification system
* Add CI/CD test pipeline
* Add Docker-based production deployment
* Add audit logs for important user actions
* Add richer text editing with safe sanitization

---

## Security Notes

* Backend authentication and authorization are the real security authority.
* Frontend protected routes improve UX but do not replace backend checks.
* Do not store secrets in frontend `.env`.
* Do not commit real `.env` files.
* Avoid `dangerouslySetInnerHTML` for user-generated content.
* Validate file type and size on both frontend and backend.
* Use safe error messages instead of exposing internal system details.
* Use `rel="noreferrer"` for external links opened with `target="_blank"`.

---

## Resume Highlights

Example resume bullets:

```txt
Built and deployed a full-stack MERN notes application with JWT authentication, CRUD operations, file uploads, Cloudinary media storage, Socket.IO real-time comments, and frontend/backend tests.
```

```txt
Implemented production-style frontend architecture with Axios service layer, React Router route guards, debounced search, reusable components, and Vitest/React Testing Library test coverage.
```

```txt
Designed Express.js REST APIs with authentication middleware, ownership authorization, Joi validation, centralized error handling, service-layer architecture, and MongoDB/Mongoose models.
```

```txt
Deployed the React frontend and Express backend using Vercel and Render with MongoDB Atlas, Cloudinary, environment-based configuration, and production CORS setup.
```

---

## Author

Prem Kumar

GitHub: `https://github.com/your-github-username`
LinkedIn: `https://linkedin.com/in/your-linkedin-profile`

---

## License

This project is open-source and available under the MIT License.

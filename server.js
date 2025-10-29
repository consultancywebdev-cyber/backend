require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// DB: Connect to MongoDB
// ----------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Required behind proxies (Render) so secure cookies & sameSite=none work
app.set('trust proxy', 1);

// ----------------------
// CORS (local + deployed)
// ----------------------
const ALLOWED_ORIGINS = [
  'http://localhost:5173',            // local dev (Vite)
  process.env.FRONTEND_ORIGIN,        // e.g. https://your-frontend.netlify.app
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests without Origin (curl, SSR, health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,
};

// -------------
// Middleware
// -------------
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Session configuration
// ----------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',                 // HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // allow cross-site cookies in prod
  },
}));

// -----------
// API Routes
// -----------
app.use('/api', routes);

// -----------
// Health check
// -----------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ----------------------
// Keep-alive pinger
// ----------------------
const TWO_MINUTES = 120_000;
// Prefer a public URL so external traffic hits your app and prevents sleep.
const KEEPALIVE_URL =
  (process.env.KEEPALIVE_URL && process.env.KEEPALIVE_URL.trim()) ||
  `http://localhost:${PORT}/health`;

async function pingKeepAlive() {
  try {
    const res = await fetch(KEEPALIVE_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // console.log(`[keepalive] ${new Date().toISOString()} OK -> ${KEEPALIVE_URL}`);
  } catch (e) {
    console.log(`[keepalive] ${new Date().toISOString()} ERR -> ${KEEPALIVE_URL} :: ${e.message}`);
  }
}
setTimeout(pingKeepAlive, 5000);
setInterval(pingKeepAlive, TWO_MINUTES);

// -----------
// Start server
// -----------
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Keepalive pings -> ${KEEPALIVE_URL} every ${TWO_MINUTES / 1000}s`);
});

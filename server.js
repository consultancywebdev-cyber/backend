require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ----------------------
// Keep-alive pinger (added)
// ----------------------
const TWO_MINUTES = 120_000;
// Prefer a public URL so external traffic hits your app and prevents sleep.
const KEEPALIVE_URL =
  (process.env.KEEPALIVE_URL && process.env.KEEPALIVE_URL.trim()) ||
  // Fallback to local health (useful for local dev; some hosts may ignore self-pings)
  `http://localhost:${PORT}/health`;

async function pingKeepAlive() {
  try {
    const res = await fetch(KEEPALIVE_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // uncomment to log every ping
    // console.log(`[keepalive] ${new Date().toISOString()} OK -> ${KEEPALIVE_URL}`);
  } catch (e) {
    // log failures only
    console.log(`[keepalive] ${new Date().toISOString()} ERR -> ${KEEPALIVE_URL} :: ${e.message}`);
  }
}

// Initial ping shortly after boot, then every 2 minutes
setTimeout(pingKeepAlive, 5000);
setInterval(pingKeepAlive, TWO_MINUTES);

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Keepalive pings -> ${KEEPALIVE_URL} every ${TWO_MINUTES / 1000}s`);
});

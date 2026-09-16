const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const journeyRoutes = require('./routes/journey.routes');
const memoryRoutes = require('./routes/memory.routes');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler } = require('./middleware/error.middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:8081', 'http://10.0.2.2:8081'].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Native clients have no Origin header. Local Expo hosts vary by LAN IP.
    if (!origin || allowedOrigins.includes(origin) || /^exp:\/\/(?:\d{1,3}\.){3}\d{1,3}:\d+$/.test(origin) || /^http:\/\/(?:192\.168|10\.)\./.test(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/journeys', journeyRoutes);
app.use('/api/v1/memories', memoryRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Memora API is running' });
});

// Error handler
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

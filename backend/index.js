const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const journeyRoutes = require('./routes/journey.routes');
const memoryRoutes = require('./routes/memory.routes');
const { errorHandler } = require('./middleware/error.middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://192.168.0.106:5000',     // Your backend
    'http://192.168.0.106:8081',     // Your frontend
    'http://10.0.2.2:5000',          // Android emulator
    'http://10.0.2.2:8081',          // Android emulator frontend
    /^exp:\/\/192\.168\.0\.106:\d+$/ // Expo Go
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/journeys', journeyRoutes);
app.use('/api/v1/memories', memoryRoutes);

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
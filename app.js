const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = [
  { path: '/auth', route: require('./routes/authRoutes') },
  { path: '/event', route: require('./routes/eventRoutes') },
  { path: '/eventDay', route: require('./routes/eventDayRoutes') },
  { path: '/item', route: require('./routes/itemRoutes') },
  { path: '/meal', route: require('./routes/mealRoutes') },
  { path: '/cart', route: require('./routes/foodCartRoutes') },
  { path: '/booking', route: require('./routes/foodBookingRoutes') },
  { path: '/user', route: require('./routes/userRoutes') },
];

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register routes
routes.forEach((r) => app.use(`/api/v1/${r.path}`, r.route));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
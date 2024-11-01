const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.listen(process.env.PORT || 5000, () => console.log('Server running'));

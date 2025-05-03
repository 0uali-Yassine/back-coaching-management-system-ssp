const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/user.routes');


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// define routes 

app.use('/api/auth', authRoutes);
app.use('/api/manager', usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

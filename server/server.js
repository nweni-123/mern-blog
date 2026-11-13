require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({ createParentPath: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 1. Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Login Route (Returns JWT)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Protected File Upload Route using express-fileupload
app.post('/api/upload', auth, async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarFile = req.files.avatar;
    const fileName = `${Date.now()}_${avatarFile.name.replace(/\s+/g, '_')}`;
    const uploadPath = path.join(__dirname, 'uploads', fileName);

    // Move file to uploads folder
    await avatarFile.mv(uploadPath);

    // Update user record in MongoDB
    const fileUrl = `/uploads/${fileName}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: fileUrl },
      { new: true }
    ).select('-password');

    res.json({ message: 'File uploaded successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
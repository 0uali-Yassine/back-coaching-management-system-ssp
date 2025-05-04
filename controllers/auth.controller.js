const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 
const mongoose = require('mongoose');


// generat jwt for  user
function generateToken(user) {
  const userObj = user.toObject();
  return jwt.sign(
    {
      id: userObj._id,
      roles: userObj.roles,
      organization: userObj.organization, //not a getter
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function register(req, res) {

    const orgId = new mongoose.Types.ObjectId(process.env.DEFAULT_ORG_ID);

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      name,
      email,
      password: hashedPassword,
      roles: ['manager'],
      organization: orgId
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles, organization: user.organization }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    // res.json({ token });
    res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, roles: user.roles,organization: user.organization }
      });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

module.exports = { register, login };

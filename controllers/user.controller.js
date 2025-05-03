const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['coach', 'entrepreneur'].includes(role)) {
      return res.status(400).json({ error: 'Only coach or entrepreneur can be created by manager.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser._id.equals(req.user.id)) {
      if (!existingUser.roles.includes(role)) {
        existingUser.roles.push(role);
        await existingUser.save();
        return res.status(200).json({ message: `Role '${role}' added to your profile.` });
      } else {
        return res.status(400).json({ message: 'You already have this role.' });
      }
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: [role],
      organization: req.user.organization // same org as manager
    });

    console.log('id from manager:', req.user.id);
    console.log('Organization from manager:', req.user.organization);


    res.status(201).json({
      message: `User created with role '${role}'.`,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, roles: newUser.roles , organization: newUser.organization }
    });

  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { createUser };

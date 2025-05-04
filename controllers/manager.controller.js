const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // in req.body must be role = string not array = like update
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


async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.organization.equals(req.user.organization)) {
      return res.status(404).json({ error: 'User not found in your organization.' });
    }

    // but if the mmanegr want to update thier account ["manager","coache"] will not so fix this
    if (user.roles.includes('manager')) {
      return res.status(403).json({ error: 'You cannot update another manager.' });
    }

    // update
    if (name) user.name = name;
    if (email) user.email = email;
    // accept array || string
    if (role) {
      user.roles = Array.isArray(role) ? role : [role];
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user || !user.organization.equals(req.user.organization)) {
      return res.status(404).json({ error: 'User not found in your organization.' });
    }

    if (user.roles.includes('manager')) {
      return res.status(403).json({ error: 'You cannot delete another manager.' });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getAllCoaches(req, res) {
  try {
    const coaches = await User.find({
      roles: { $in: ['coach'] },
      organization: req.user.organization
    }).select('-password'); // without passwoed

    res.status(200).json({ users: coaches });
  } catch (err) {
    console.error('Error getting coaches:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}


async function getAllEntrepreneurs(req, res) {
  try {
    const entrepreneurs = await User.find({
      roles: { $in: ['entrepreneur'] },
      organization: req.user.organization
    }).select('-password');

    res.status(200).json({ users: entrepreneurs });
  } catch (err) {
    console.error('Error getting entrepreneurs:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}




module.exports = { createUser,updateUser,deleteUser,getAllCoaches,getAllEntrepreneurs };

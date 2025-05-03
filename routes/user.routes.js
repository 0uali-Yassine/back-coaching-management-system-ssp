const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/user.controller');
const protect = require('../middleware/auth'); 
const permit = require('../middleware/roleGuard');

router.post('/add-user', protect,permit('manager'), createUser);

module.exports = router;

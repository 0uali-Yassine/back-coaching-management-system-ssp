const express = require('express');
const router = express.Router();
const { createUser,updateUser,deleteUser,getAllCoaches,getAllEntrepreneurs } = require('../controllers/manager.controller');
const protect = require('../middleware/auth'); 
const permit = require('../middleware/roleGuard');

router.post('/add-user', protect,permit('manager'), createUser);
router.put('/user/:id', protect,permit('manager'), updateUser);
router.delete('/user/:id', protect,permit('manager'), deleteUser);
router.get('/users/coaches', protect,permit('manager'), getAllCoaches);
router.get('/users/entrepreneurs', protect,permit('manager'), getAllEntrepreneurs);

module.exports = router;

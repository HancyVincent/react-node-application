const express = require('express');
const { uploadImage, getImage } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/upload', authenticate, uploadImage);
router.get('/image', authenticate, getImage);
module.exports = router;

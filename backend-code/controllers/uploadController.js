const Image = require('../models/Image');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: 'Image upload failed' });
    try {
      const imageData = req.file.buffer.toString('base64');
      const image = new Image({ userId: req.user.userId, imageData });
      await image.save();
      res.json({ message: 'Image uploaded successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Image save failed' });
    }
  });
};

exports.getImage = async (req, res) => {
  try {
    const image = await Image.findOne({ userId: req.user.userId });
    if (!image) return res.status(404).json({ error: 'No image found' });
    res.json({ imageData: image.imageData });
  } catch (error) {
    res.status(500).json({ error: 'Image retrieval failed' });
  }
};

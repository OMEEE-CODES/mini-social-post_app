const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

// ── Multer configuration ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── GET /api/posts — public feed ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email')
      .populate('comments.user', 'name');

    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Get posts error:', err.message);
    return res.status(500).json({ message: 'Server error while fetching posts.' });
  }
});

// ── POST /api/posts — create post (auth required, multipart/form-data) ───────
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const text = req.body.text ? req.body.text.trim() : '';
    let imageUrl = '';

    if (req.file) {
      // Build the accessible URL for the uploaded file
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'A post must have at least a text or an image.' });
    }

    const post = new Post({
      author: req.user.id,
      text,
      imageUrl,
    });

    await post.save();
    await post.populate('author', 'name email');

    return res.status(201).json({ post });
  } catch (err) {
    console.error('Create post error:', err.message);
    return res.status(500).json({ message: 'Server error while creating post.' });
  }
});

// ── PUT /api/posts/:id/like — toggle like (auth required) ────────────────────
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (err) {
    console.error('Like/unlike error:', err.message);
    return res.status(500).json({ message: 'Server error while toggling like.' });
  }
});

// ── POST /api/posts/:id/comment — add comment (auth required) ────────────────
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = { user: req.user.id, text: text.trim() };
    post.comments.push(comment);
    await post.save();

    // Return the newly added comment with populated user
    await post.populate('comments.user', 'name');
    const newComment = post.comments[post.comments.length - 1];

    return res.status(201).json({ comment: newComment });
  } catch (err) {
    console.error('Add comment error:', err.message);
    return res.status(500).json({ message: 'Server error while adding comment.' });
  }
});

module.exports = router;

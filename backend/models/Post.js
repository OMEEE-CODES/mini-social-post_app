const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Validate that at least one of text or imageUrl is provided
postSchema.pre('validate', function (next) {
  if (!this.text && !this.imageUrl) {
    this.invalidate('text', 'A post must have at least a text or an image.');
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);

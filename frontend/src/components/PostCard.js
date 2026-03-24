import React, { useState } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiMessageCircle, FiSend } from 'react-icons/fi';

const API_BASE = 'https://mini-social-post-app-456x.onrender.com';

// Helper: get initials from a name
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

// Helper: format date nicely
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const PostCard = ({ post, onUpdate }) => {
  const { token, user } = useAuth();

  // Derive state from the post prop (parent owns truth)
  const liked = post.likes?.some(
    (id) => String(id) === String(user?._id || user?.id)
  );
  const likeCount = post.likes?.length ?? 0;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const authorName =
    post.author?.name || post.user?.name || 'Unknown User';
  const postId = post._id;

  // ── Like toggle ────────────────────────────────────────────────
  const handleLikeToggle = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns { liked, likesCount, likes } — merge into current post
      if (onUpdate) onUpdate({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error('Like error:', err.response?.data || err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Add comment ───────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || commentLoading) return;

    setCommentLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/posts/${postId}/comment`,
        { text: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      // Backend returns { comment } — append to current post's comments
      if (onUpdate) onUpdate({ ...post, comments: [...(post.comments || []), res.data.comment] });
    } catch (err) {
      console.error('Comment error:', err.response?.data || err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const comments = post.comments || [];
  const commentCount = comments.length;

  return (
    <Card className="post-card">
      {/* ── Header ────────────────────────────────────────────── */}
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="post-author-avatar">{getInitials(authorName)}</div>
          <div>
            <div className="post-author-name">{authorName}</div>
            <div className="post-date">{formatDate(post.createdAt)}</div>
          </div>
        </div>

        {/* ── Post text ─────────────────────────────────────── */}
        {post.text && <p className="post-text mb-0">{post.text}</p>}
      </Card.Body>

      {/* ── Post image (full-bleed) ──────────────────────────── */}
      {post.imageUrl && (
        <img
          src={
            post.imageUrl.startsWith('http')
              ? post.imageUrl
              : `${API_BASE}/${post.imageUrl}`
          }
          alt="Post"
          className="post-image"
          loading="lazy"
        />
      )}

      {/* ── Actions row ───────────────────────────────────────── */}
      <Card.Body className="pt-0">
        <div className="post-actions d-flex align-items-center gap-1">
          {/* Like button */}
          <button
            className={`like-btn${liked ? ' liked' : ''}`}
            onClick={handleLikeToggle}
            disabled={likeLoading}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            {likeLoading ? (
              <Spinner animation="border" size="sm" />
            ) : liked ? (
              <FaHeart className="like-icon" />
            ) : (
              <FaRegHeart className="like-icon" />
            )}
            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          {/* Comment toggle */}
          <button
            className="comment-toggle-btn"
            onClick={() => setShowComments((v) => !v)}
            aria-expanded={showComments}
            aria-label="Toggle comments"
          >
            <FiMessageCircle size={16} />
            <span>
              {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
        </div>

        {/* ── Comments section ────────────────────────────────── */}
        {showComments && (
          <div className="comments-section">
            {/* Existing comments */}
            {comments.length === 0 && (
              <p className="text-muted mb-2" style={{ fontSize: '0.83rem' }}>
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((c, idx) => {
              const commenterName =
                c.user?.name || c.author?.name || 'Unknown';
              return (
                <div className="comment-item" key={c._id || idx}>
                  <div className="comment-avatar">
                    {getInitials(commenterName)}
                  </div>
                  <div className="comment-bubble">
                    <div className="comment-author">{commenterName}</div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Add comment input */}
            <Form onSubmit={handleAddComment} className="comment-input-row">
              <div className="comment-avatar" style={{ flexShrink: 0 }}>
                {getInitials(user?.name)}
              </div>
              <Form.Control
                type="text"
                placeholder="Write a comment..."
                className="comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                disabled={commentLoading}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="comment-submit-btn"
                disabled={!commentText.trim() || commentLoading}
                aria-label="Submit comment"
              >
                {commentLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FiSend size={13} />
                )}
              </Button>
            </Form>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PostCard;

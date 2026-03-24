import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const API_BASE = 'http://localhost:5001';

// ── Skeleton card shown while loading ────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="card mb-4"
    style={{
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}
  >
    <div className="card-body">
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '35%' }} />
          <div className="skeleton skeleton-line" style={{ width: '20%', marginBottom: 0 }} />
        </div>
      </div>
      <div className="skeleton skeleton-line" style={{ width: '100%' }} />
      <div className="skeleton skeleton-line" style={{ width: '85%' }} />
      <div className="skeleton skeleton-line" style={{ width: '60%', marginBottom: 0 }} />
    </div>
    <div className="skeleton skeleton-image" />
    <div className="card-body">
      <div className="skeleton skeleton-line" style={{ width: '30%' }} />
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">📭</div>
    <h5 className="text-muted fw-semibold mb-1">No posts yet</h5>
    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
      Be the first to share something with the world!
    </p>
  </div>
);

// ── Feed page ─────────────────────────────────────────────────────────────────
const Feed = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchPosts = useCallback(async () => {
    setFetchError('');
    try {
      const res = await axios.get(`${API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Newest posts first
      const sorted = [...(res.data.posts || res.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load posts. Please refresh.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Called when a new post is created — prepend to top
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Called when a post is updated (like/comment) — replace in list
  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <div className="feed-top-spacing">
      <Container>
        <div className="feed-container">

          {/* Create post */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Error banner */}
          {fetchError && (
            <Alert
              variant="danger"
              className="form-error-alert d-flex justify-content-between align-items-center"
            >
              <span>{fetchError}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={fetchPosts}
                style={{ borderRadius: '8px' }}
              >
                Retry
              </button>
            </Alert>
          )}

          {/* Loading skeletons */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Empty state */}
          {!loading && !fetchError && posts.length === 0 && <EmptyState />}

          {/* Post list */}
          {!loading &&
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handlePostUpdate}
              />
            ))}

        </div>
      </Container>
    </div>
  );
};

export default Feed;

import React, { useState, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiSend, FiX } from 'react-icons/fi';

const API_BASE = 'http://localhost:5001';

const CreatePost = ({ onPostCreated }) => {
  const { token, user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setError('');
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedText = text.trim();
    if (!trimmedText && !image) {
      setError('Please write something or attach an image.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (trimmedText) formData.append('text', trimmedText);
      if (image) formData.append('image', image);

      const res = await axios.post(`${API_BASE}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setText('');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onPostCreated) onPostCreated(res.data.post || res.data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create post. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="create-post-card">
      <Card.Body>
        <div className="create-post-header">
          <div className="create-post-avatar">{getInitials(user?.name)}</div>
          <span className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>
            What's on your mind, {user?.name?.split(' ')[0] || 'there'}?
          </span>
        </div>

        {error && (
          <Alert variant="danger" className="form-error-alert py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share something with the world..."
              className="create-post-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
            />
            {text.length > 800 && (
              <Form.Text className={text.length >= 1000 ? 'text-danger' : 'text-muted'}>
                {text.length}/1000
              </Form.Text>
            )}
          </Form.Group>

          {/* Image preview */}
          {imagePreview && (
            <div className="mb-3">
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={handleRemoveImage}
                  title="Remove image"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            {/* File picker */}
            <div>
              <input
                type="file"
                accept="image/*"
                className="d-none"
                ref={fileInputRef}
                onChange={handleImageChange}
                id="post-image-input"
              />
              <label
                htmlFor="post-image-input"
                className="btn btn-outline-secondary btn-sm file-input-label"
              >
                <FiImage size={16} />
                {image ? 'Change Photo' : 'Add Photo'}
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || (!text.trim() && !image)}
              className="d-flex align-items-center gap-2"
              style={{ borderRadius: '20px', paddingLeft: '18px', paddingRight: '18px', fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Posting...
                </>
              ) : (
                <>
                  <FiSend size={14} />
                  Post
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreatePost;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postsAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Editor = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    featuredImage: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchPost();
    }
  }, [editId]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(editId);
      const post = response.data.data.post;
      
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        tags: post.tags ? post.tags.join(', ') : '',
        featuredImage: post.featuredImage || '',
        status: post.status,
      });
      setIsEditMode(true);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status) => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const postData = {
        ...formData,
        status,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
      };

      let response;
      if (isEditMode) {
        response = await postsAPI.updatePost(editId, postData);
      } else {
        response = await postsAPI.createPost(postData);
      }

      const postId = response.data.data.post._id;
      navigate(`/post/${postId}`);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to save post' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Share your story with the world
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <Card>
            <div className="space-y-6">
              {/* Title */}
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter an engaging title..."
                error={errors.title}
                required
              />

              {/* Content */}
              <Textarea
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tell your story..."
                rows={15}
                error={errors.content}
                required
              />

              {/* Excerpt */}
              <Textarea
                label="Excerpt (Optional)"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="A brief summary of your post..."
                rows={3}
                helperText="This will be shown in post previews. If left empty, it will be auto-generated."
              />

              {/* Featured Image */}
              <Input
                label="Featured Image URL (Optional)"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />

              {formData.featuredImage && (
                <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={formData.featuredImage}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              <Input
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="javascript, web development, tutorial"
                helperText="Separate tags with commas"
              />
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  loading={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('published')}
                  loading={loading}
                >
                  {isEditMode ? 'Update & Publish' : 'Publish'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;


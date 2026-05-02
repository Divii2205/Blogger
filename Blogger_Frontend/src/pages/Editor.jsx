import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { postsAPI, uploadAPI } from "../utils/api";
import Layout from "../components/layout/Layout";
import PageContainer from "../components/layout/PageContainer";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const Editor = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    featuredImage: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [publishSettings, setPublishSettings] = useState({
    seoTitle: "",
    canonicalUrl: "",
  });

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
        excerpt: post.excerpt || "",
        tags: post.tags ? post.tags.join(", ") : "",
        featuredImage: post.featuredImage || "",
        status: post.status,
      });
      setPublishSettings({
        seoTitle: post.metadata?.seoTitle || "",
        canonicalUrl: post.metadata?.canonicalUrl || "",
      });
      setIsEditMode(true);
    } catch (error) {
      console.error("Failed to fetch post:", error);
    }
  };

  const LabelWithTooltip = ({ text, tooltip }) => (
    <div className="flex items-center gap-1.5">
      {text}
      {/* Scope 'relative' and 'group' ONLY to this icon container */}
      <div className="relative group text-neutral-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* The Tooltip (Absolute relative to the icon wrapper above) */}
        <div className="absolute border-radius-md bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-100 text-neutral-800 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal">
          {tooltip}
          {/* Little arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-100"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const autosaveKey = editId
      ? `editor-autosave-${editId}`
      : "editor-autosave-new";
    const hasContent =
      formData.title ||
      formData.content ||
      formData.excerpt ||
      formData.tags ||
      formData.featuredImage;
    if (!hasContent) return undefined;

    // Debounce so a user typing a sentence doesn't trigger 50+ JSON.stringify
    // + localStorage writes. The cleanup cancels the pending write when the
    // user keeps typing.
    const handle = setTimeout(() => {
      localStorage.setItem(
        autosaveKey,
        JSON.stringify({ formData, publishSettings, timestamp: Date.now() }),
      );
      setLastSavedAt(new Date());
    }, 800);

    return () => clearTimeout(handle);
  }, [formData, publishSettings, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Quick validation
    if (!file.type.startsWith("image/")) {
      setErrors({ general: "Please select a valid image file" });
      return;
    }

    setUploadingImage(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const fd = new FormData();
      fd.append("image", file);
      const response = await uploadAPI.uploadImage(fd);
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          featuredImage: response.data.data.url,
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || "Failed to upload image",
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
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
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        metadata: {
          seoTitle: publishSettings.seoTitle,
          canonicalUrl: publishSettings.canonicalUrl,
        },
      };

      let response;
      if (isEditMode) {
        response = await postsAPI.updatePost(editId, postData);
      } else {
        response = await postsAPI.createPost(postData);
      }

      const nextPost = response.data.data.post;
      navigate(nextPost.slug ? `/p/${nextPost.slug}` : `/post/${nextPost._id}`);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Failed to save post",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer paddingY="py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? "Edit Post" : "Write a New Post"}
            </h1>
            <Button
              variant="outline"
              onClick={() => setPreviewMode((prev) => !prev)}
            >
              {previewMode ? "Back to Editor" : "Preview"}
            </Button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Share your story with the world
          </p>
          {lastSavedAt && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Autosaved at {lastSavedAt.toLocaleTimeString()}
            </p>
          )}
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

          {!previewMode ? (
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
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Featured Image
                  </label>

                  {!formData.featuredImage ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-neutral-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                            <span>
                              {uploadingImage
                                ? "Uploading..."
                                : "Upload a file"}
                            </span>
                            <input
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-neutral-500 pt-2">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                      <img
                        src={formData.featuredImage}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-contain bg-neutral-50 dark:bg-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            featuredImage: "",
                          }))
                        }
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Fallback link input just in case */}
                  <div className="pt-2">
                    <Input
                      name="featuredImage"
                      value={formData.featuredImage}
                      onChange={handleChange}
                      placeholder="Or paste an image URL directly..."
                      helperText="URL automatically syncing"
                    />
                  </div>
                </div>

                {/* Tags */}
                <Input
                  label="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="javascript, web development, tutorial"
                  helperText="Separate tags with commas"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={
                      <LabelWithTooltip
                        text="SEO Title"
                        tooltip="The specific title displayed in Google search results."
                      />
                    }
                    value={publishSettings.seoTitle}
                    onChange={(e) =>
                      setPublishSettings((prev) => ({
                        ...prev,
                        seoTitle: e.target.value,
                      }))
                    }
                    placeholder="Readable search title..."
                  />
                  <Input
                    label={
                      <LabelWithTooltip
                        text="Canonical URL"
                        tooltip="The 'master' URL if this content exists elsewhere."
                      />
                    }
                    value={publishSettings.canonicalUrl}
                    onChange={(e) =>
                      setPublishSettings((prev) => ({
                        ...prev,
                        canonicalUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/article"
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <article className="prose prose-lg dark:prose-invert max-w-none">
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
                  />
                )}
                <h1>{formData.title || "Untitled Post"}</h1>
                {formData.excerpt && <p>{formData.excerpt}</p>}
                <div className="whitespace-pre-wrap">
                  {formData.content || "Start writing to preview your draft..."}
                </div>
              </article>
            </Card>
          )}

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
                  onClick={() => handleSubmit("draft")}
                  loading={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit("published")}
                  loading={loading}
                >
                  {isEditMode ? "Update & Publish" : "Publish"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Editor;

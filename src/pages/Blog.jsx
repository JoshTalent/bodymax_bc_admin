"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Eye,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Grid,
  List,
  Copy,
  Star,
  User,
  Clock,
  TrendingUp,
  Dumbbell,
  Utensils,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminBlog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "fitness",
    readTime: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
    featured: false,
    status: "draft",
    tags: [],
    slug: "",
  });

  const [tagInput, setTagInput] = useState("");

  // API Configuration
  const API_BASE_URL = "http://localhost:8000/api";

  // Categories
  const categories = [
    { id: "all", name: "All Categories", icon: FileText },
    { id: "fitness", name: "Fitness & Weight Loss", icon: TrendingUp },
    { id: "technique", name: "Boxing Technique", icon: Dumbbell },
    { id: "nutrition", name: "Nutrition", icon: Utensils },
    { id: "success", name: "Success Stories", icon: Heart },
    { id: "beginners", name: "Beginner Guides", icon: Users },
  ];

  // Load blog posts from API
  const loadBlogPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.itemsPerPage,
      });

      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(`${API_BASE_URL}/blog?${params}`);

      if (response.data.success) {
        setBlogPosts(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading blog posts:", error);
      showNotification("error", "Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadBlogPosts(1);
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBlogPosts(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Stats
  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter((p) => p.status === "published").length,
    drafts: blogPosts.filter((p) => p.status === "draft").length,
    featured: blogPosts.filter((p) => p.featured).length,
    totalViews: blogPosts.reduce((acc, post) => acc + (post.views || 0), 0),
    totalLikes: blogPosts.reduce((acc, post) => acc + (post.likes || 0), 0),
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Auto-generate slug from title
      ...(name === "title" && {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }),
    }));
  };

  // Handle tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // CRUD Operations with API
  const handleAdd = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "fitness",
      readTime: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
      featured: false,
      status: "draft",
      tags: [],
      slug: "",
    });
    setTagInput("");
    setShowAddModal(true);
  };

  const handleEdit = async (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      category: item.category || "fitness",
      readTime: item.readTime || "",
      author: item.author || "",
      date: item.date
        ? item.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      image: item.image || "",
      featured: item.featured || false,
      status: item.status || "draft",
      tags: item.tags || [],
      slug: item.slug || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = async () => {
    // Validate form
    if (
      !formData.title ||
      !formData.excerpt ||
      !formData.image ||
      !formData.author
    ) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/blog`, formData);

      if (response.data.success) {
        showNotification("success", "Blog post created successfully");
        setShowAddModal(false);
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to create post",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmEdit = async () => {
    // Validate form
    if (
      !formData.title ||
      !formData.excerpt ||
      !formData.image ||
      !formData.author
    ) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/blog/${selectedItem._id || selectedItem.id}`,
        formData,
      );

      if (response.data.success) {
        showNotification("success", "Blog post updated successfully");
        setShowEditModal(false);
        setSelectedItem(null);
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to update post",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/blog/${selectedItem._id || selectedItem.id}`,
      );

      if (response.data.success) {
        showNotification("success", "Blog post deleted successfully");
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to delete post",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (item) => {
    setIsSubmitting(true);
    try {
      const duplicateData = {
        ...item,
        title: `${item.title} (Copy)`,
        slug: `${item.slug}-copy`,
        views: 0,
        likes: 0,
        comments: 0,
        status: "draft",
      };
      delete duplicateData._id;
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const response = await axios.post(`${API_BASE_URL}/blog`, duplicateData);

      if (response.data.success) {
        showNotification("success", "Post duplicated successfully");
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error duplicating post:", error);
      showNotification("error", "Failed to duplicate post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/blog/${item._id || item.id}`,
        {
          featured: !item.featured,
        },
      );

      if (response.data.success) {
        showNotification(
          "success",
          item.featured ? "Removed from featured" : "Added to featured",
        );
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      showNotification("error", "Failed to update featured status");
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    try {
      const response = await axios.put(
        `${API_BASE_URL}/blog/${item._id || item.id}`,
        {
          status: newStatus,
        },
      );

      if (response.data.success) {
        showNotification(
          "success",
          `Post ${newStatus === "published" ? "published" : "moved to drafts"}`,
        );
        loadBlogPosts(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      showNotification("error", "Failed to update status");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      3000,
    );
  };

  // Preview modal handlers
  const openPreview = (item) => {
    setPreviewItem(item);
    setPreviewMode(true);
    document.body.style.overflow = "hidden";
  };

  const closePreview = () => {
    setPreviewItem(null);
    setPreviewMode(false);
    document.body.style.overflow = "unset";
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.icon || FileText;
  };

  const handlePageChange = (newPage) => {
    loadBlogPosts(newPage);
  };

  const refreshData = () => {
    loadBlogPosts(pagination.currentPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="md:ml-[18%] min-h-screen pt-16 md:pt-0 max-sm:pl-14 max-sm:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Blog Management
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25 text-sm sm:text-base"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Total Posts",
                value: stats.total,
                icon: FileText,
                color: "blue",
              },
              {
                label: "Published",
                value: stats.published,
                icon: CheckCircle,
                color: "green",
              },
              {
                label: "Drafts",
                value: stats.drafts,
                icon: Clock,
                color: "yellow",
              },
              {
                label: "Featured",
                value: stats.featured,
                icon: Star,
                color: "purple",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-${stat.color}-100 flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}-600`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 sm:px-8 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 lg:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 lg:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 rounded-lg sm:rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Grid size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <List size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid/List */}
        <div className="px-4 sm:px-8 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">
                  Loading blog posts...
                </p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {blogPosts.map((post, index) => {
                    const CategoryIcon = getCategoryIcon(post.category);
                    return (
                      <motion.div
                        key={post._id || post.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />

                          {/* Status Badge */}
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1">
                            {post.status === "draft" && (
                              <span className="bg-yellow-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                Draft
                              </span>
                            )}
                            {post.featured && (
                              <span className="bg-purple-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                                <Star size={8} className="sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">
                                  Featured
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                            <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1">
                              <CategoryIcon
                                size={8}
                                className="sm:w-3 sm:h-3"
                              />
                              <span className="capitalize">
                                {post.category}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            <button
                              onClick={() => openPreview(post)}
                              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center"
                              title="Preview"
                            >
                              <Eye size={14} className="sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(post)}
                              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center"
                              title="Edit"
                            >
                              <Pencil size={14} className="sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(post)}
                              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={14} className="sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar size={10} className="sm:w-3 sm:h-3" />
                              <span>
                                {new Date(post.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={10} className="sm:w-3 sm:h-3" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 mb-2 h-10 sm:h-12">
                            {post.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 h-10">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <User size={10} className="sm:w-3 sm:h-3" />
                              <span className="truncate max-w-[80px]">
                                {post.author}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{post.views || 0} views</span>
                              <span>•</span>
                              <span>{post.likes || 0} likes</span>
                            </div>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => toggleFeatured(post)}
                              className={`text-[10px] sm:text-xs px-2 py-1 rounded-lg transition-colors ${
                                post.featured
                                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {post.featured ? "Featured" : "Mark Featured"}
                            </button>
                            <button
                              onClick={() => toggleStatus(post)}
                              className={`text-[10px] sm:text-xs px-2 py-1 rounded-lg transition-colors ${
                                post.status === "published"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }`}
                            >
                              {post.status === "published"
                                ? "Published"
                                : "Draft"}
                            </button>
                            <button
                              onClick={() => handleDuplicate(post)}
                              className="text-[10px] sm:text-xs p-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Duplicate"
                              disabled={isSubmitting}
                            >
                              <Copy size={12} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[8px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="text-[8px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Post
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Category
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Author
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Date
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Stats
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {blogPosts.map((post) => {
                          const CategoryIcon = getCategoryIcon(post.category);
                          return (
                            <tr
                              key={post._id || post.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={post.image}
                                      alt={post.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://via.placeholder.com/400x300?text=No+Image";
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate max-w-[200px]">
                                      {post.title}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                                      {post.excerpt}
                                    </p>
                                    {post.featured && (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 mt-1">
                                        <Star size={8} />
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-1">
                                  <CategoryIcon
                                    size={12}
                                    className="text-gray-400"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-600 capitalize">
                                    {post.category}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-1">
                                  <User size={12} className="text-gray-400" />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {post.author}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-1">
                                  <Calendar
                                    size={12}
                                    className="text-gray-400"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {new Date(post.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-600">
                                    {post.views || 0} views
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {post.likes || 0} likes
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                {post.status === "published" ? (
                                  <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-2 py-1 rounded-full">
                                    Published
                                  </span>
                                ) : (
                                  <span className="bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs px-2 py-1 rounded-full">
                                    Draft
                                  </span>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <button
                                    onClick={() => openPreview(post)}
                                    className="p-1 sm:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Preview"
                                  >
                                    <Eye size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(post)}
                                    className="p-1 sm:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil
                                      size={14}
                                      className="sm:w-4 sm:h-4"
                                    />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post)}
                                    className="p-1 sm:p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2
                                      size={14}
                                      className="sm:w-4 sm:h-4"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        pagination.currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {blogPosts.length === 0 && !isLoading && (
                <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    No posts found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedStatus("all");
                      setSearchQuery("");
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (!isSubmitting) {
                setShowAddModal(false);
                setShowEditModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {showAddModal ? "Create New Blog Post" : "Edit Blog Post"}
                </h2>
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter post title"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the post"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full article content..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Author name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Read Time
                    </label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5 min read"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="auto-generated-from-title"
                      readOnly
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">
                        Featured Post
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag and press Enter"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      disabled={isSubmitting}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                          disabled={isSubmitting}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 flex items-center justify-end gap-4">
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? confirmAdd : confirmEdit}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {showAddModal ? "Create Post" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Delete Blog Post
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Are you sure you want to delete "{selectedItem.title}"? This
                  action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="animate-spin mx-auto" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMode && previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto"
            onClick={closePreview}
          >
            <div className="absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center justify-between p-3 sm:p-6">
                <button
                  onClick={closePreview}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors flex items-center justify-center border border-white/20"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      closePreview();
                      handleEdit(previewItem);
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-green-600/70 transition-colors flex items-center justify-center border border-white/20"
                  >
                    <Pencil size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => {
                      closePreview();
                      handleDelete(previewItem);
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-red-600/70 transition-colors flex items-center justify-center border border-white/20"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-screen bg-white mt-16">
              <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Featured Image */}
                <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
                  <img
                    src={previewItem.image}
                    alt={previewItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/1200x400?text=No+Image";
                    }}
                  />
                  {previewItem.featured && (
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star size={16} />
                      <span>Featured Post</span>
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>
                      {new Date(previewItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{previewItem.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>By {previewItem.author}</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {previewItem.title}
                </h1>

                {/* Category & Tags */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                    {previewItem.category}
                  </span>
                  {previewItem.tags &&
                    previewItem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                {/* Excerpt */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                  <p className="text-gray-700 italic">{previewItem.excerpt}</p>
                </div>

                {/* Content */}
                <div className="prose max-w-none space-y-6 text-gray-700">
                  {previewItem.content ? (
                    previewItem.content.split('\n\n').map((para, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-600 leading-relaxed italic">
                      Full article content would appear here...
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-gray-400" />
                    <span className="text-gray-600">
                      {previewItem.views || 0} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={18} className="text-gray-400" />
                    <span className="text-gray-600">
                      {previewItem.likes || 0} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-gray-400" />
                    <span className="text-gray-600">
                      {previewItem.comments || 0} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-xl flex items-center gap-2 sm:gap-3 ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            } text-sm sm:text-base`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlog;

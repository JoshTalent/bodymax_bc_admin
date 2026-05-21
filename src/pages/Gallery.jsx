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
  Image,
  Save,
  AlertCircle,
  CheckCircle,
  Grid,
  List,
  Copy,
  Crown,
  User,
  FileText,
  Dumbbell,
  Users,
  Trophy,
  Target,
  Loader,
  RefreshCw,
  MapPin,
  Clock,
  Tag,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    itemsPerPage: 12,
  });

  // Form state
  const [formData, setFormData] = useState({
    type: "image",
    category: "training",
    src: "",
    thumbnail: "",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    views: 0,
    likes: 0,
    comments: 0,
    tags: [],
    featured: false,
    coach: "",
    location: "",
    duration: "",
    equipment: [],
    status: "published",
  });

  const [tagInput, setTagInput] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");

  // API Configuration
  const API_BASE_URL = "https://bodymax-bc-backend.onrender.com/api";

  // Categories
  const categories = [
    {
      id: "all",
      name: "All Items",
      icon: Grid,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "training",
      name: "Training",
      icon: Dumbbell,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "coach",
      name: "Coaches",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "championship",
      name: "Championships",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "profile",
      name: "Profiles",
      icon: Target,
      color: "from-red-500 to-rose-500",
    },
  ];

  // Load gallery items from API
  const loadGalleryItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.itemsPerPage,
      });

      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(`${API_BASE_URL}/gallery?${params}`);

      if (response.data.success) {
        setGalleryItems(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading gallery items:", error);
      showNotification("error", "Failed to load gallery items");
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadGalleryItems(1);
  }, [selectedCategory]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadGalleryItems(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Stats
  const stats = {
    total: galleryItems.length,
    published: galleryItems.filter((i) => i.status === "published").length,
    drafts: galleryItems.filter((i) => i.status === "draft").length,
    featured: galleryItems.filter((i) => i.featured).length,
    totalViews: galleryItems.reduce((acc, item) => acc + (item.views || 0), 0),
    totalLikes: galleryItems.reduce((acc, item) => acc + (item.likes || 0), 0),
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  // Handle equipment
  const addEquipment = () => {
    if (
      equipmentInput.trim() &&
      !formData.equipment.includes(equipmentInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()],
      }));
      setEquipmentInput("");
    }
  };

  const removeEquipment = (itemToRemove) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((item) => item !== itemToRemove),
    }));
  };

  // CRUD Operations with API
  const handleAdd = () => {
    setFormData({
      type: "image",
      category: "training",
      src: "",
      thumbnail: "",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      views: 0,
      likes: 0,
      comments: 0,
      tags: [],
      featured: false,
      coach: "",
      location: "",
      duration: "",
      equipment: [],
      status: "published",
    });
    setTagInput("");
    setEquipmentInput("");
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      type: item.type || "image",
      category: item.category || "training",
      src: item.src || "",
      thumbnail: item.thumbnail || "",
      title: item.title || "",
      description: item.description || "",
      date: item.date
        ? item.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      views: item.views || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
      tags: item.tags || [],
      featured: item.featured || false,
      coach: item.coach || "",
      location: item.location || "",
      duration: item.duration || "",
      equipment: item.equipment || [],
      status: item.status || "published",
    });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.src) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/gallery`, formData);

      if (response.data.success) {
        showNotification("success", "Gallery item created successfully");
        setShowAddModal(false);
        loadGalleryItems(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error creating item:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to create item",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmEdit = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.src) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/gallery/${selectedItem._id || selectedItem.id}`,
        formData,
      );

      if (response.data.success) {
        showNotification("success", "Gallery item updated successfully");
        setShowEditModal(false);
        setSelectedItem(null);
        loadGalleryItems(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to update item",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/gallery/${selectedItem._id || selectedItem.id}`,
      );

      if (response.data.success) {
        showNotification("success", "Gallery item deleted successfully");
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadGalleryItems(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to delete item",
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
        views: 0,
        likes: 0,
        comments: 0,
      };
      delete duplicateData._id;
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const response = await axios.post(
        `${API_BASE_URL}/gallery`,
        duplicateData,
      );

      if (response.data.success) {
        showNotification("success", "Item duplicated successfully");
        loadGalleryItems(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error duplicating item:", error);
      showNotification("error", "Failed to duplicate item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/gallery/${item._id || item.id}`,
        {
          featured: !item.featured,
        },
      );

      if (response.data.success) {
        showNotification(
          "success",
          item.featured ? "Removed from featured" : "Added to featured",
        );
        loadGalleryItems(pagination.currentPage);
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
        `${API_BASE_URL}/gallery/${item._id || item.id}`,
        {
          status: newStatus,
        },
      );

      if (response.data.success) {
        showNotification(
          "success",
          `Item ${newStatus === "published" ? "published" : "moved to drafts"}`,
        );
        loadGalleryItems(pagination.currentPage);
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

  const handlePageChange = (newPage) => {
    loadGalleryItems(newPage);
  };

  const refreshData = () => {
    loadGalleryItems(pagination.currentPage);
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - Adjusted margin to account for navbar */}
      <main className="md:ml-[18%] min-h-screen pt-16 md:pt-0 max-sm:pl-14 max-sm:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gallery Management
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
                <span className="hidden sm:inline">Add New Item</span>
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
                label: "Total Items",
                value: stats.total,
                icon: Image,
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
                icon: FileText,
                color: "yellow",
              },
              {
                label: "Featured",
                value: stats.featured,
                icon: Crown,
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
                  placeholder="Search gallery items..."
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

                {/* View Mode */}
                <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 rounded-lg sm:rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Grid size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === "list"
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

        {/* Gallery Grid/List */}
        <div className="px-4 sm:px-8 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">
                  Loading gallery items...
                </p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {galleryItems.map((item, index) => (
                    <motion.div
                      key={item._id || item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.thumbnail || item.src}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x400?text=No+Image";
                          }}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1">
                          {item.status === "draft" && (
                            <span className="bg-yellow-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                              Draft
                            </span>
                          )}
                          {item.featured && (
                            <span className="bg-purple-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                              <Crown size={8} className="sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">Featured</span>
                            </span>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <span
                            className={`bg-gradient-to-r ${getCategoryColor(item.category)} text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full capitalize`}
                          >
                            {item.category}
                          </span>
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <button
                            onClick={() => openPreview(item)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center"
                            title="Preview"
                          >
                            <Eye size={14} className="sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center"
                            title="Edit"
                          >
                            <Pencil size={14} className="sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg text-gray-900 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 size={14} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1 flex-1">
                            {item.title}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} className="sm:w-3 sm:h-3" />
                            <span>
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={10} className="sm:w-3 sm:h-3" />
                            <span>{(item.views || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Location & Coach if available */}
                        {(item.location || item.coach) && (
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-2">
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={10} className="sm:w-3 sm:h-3" />
                                <span className="truncate max-w-[80px]">
                                  {item.location}
                                </span>
                              </div>
                            )}
                            {item.coach && (
                              <div className="flex items-center gap-1">
                                <User size={10} className="sm:w-3 sm:h-3" />
                                <span className="truncate max-w-[80px]">
                                  {item.coach}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => toggleFeatured(item)}
                            className={`text-[10px] sm:text-xs px-2 py-1 rounded-lg transition-colors ${item.featured
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            {item.featured ? "Featured" : "Mark Featured"}
                          </button>
                          <button
                            onClick={() => toggleStatus(item)}
                            className={`text-[10px] sm:text-xs px-2 py-1 rounded-lg transition-colors ${item.status === "published"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }`}
                          >
                            {item.status === "published"
                              ? "Published"
                              : "Draft"}
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="text-[10px] sm:text-xs p-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Duplicate"
                            disabled={isSubmitting}
                          >
                            <Copy size={12} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[8px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-[8px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Image
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Title
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                            Category
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
                        {galleryItems.map((item) => (
                          <tr
                            key={item._id || item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                                <img
                                  src={item.thumbnail || item.src}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/400x400?text=No+Image";
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div>
                                <p className="font-medium text-xs sm:text-sm text-gray-900">
                                  {item.title}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="text-xs sm:text-sm text-gray-600 capitalize">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="text-xs sm:text-sm text-gray-600">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  {item.views || 0} views
                                </span>
                                <span className="text-xs text-gray-600">
                                  {item.likes || 0} likes
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              {item.status === "published" ? (
                                <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                  Published
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => openPreview(item)}
                                  className="p-1 sm:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <Eye size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1 sm:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1 sm:p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
                      className={`px-3 py-1 rounded-lg text-sm ${pagination.currentPage === i + 1
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

              {galleryItems.length === 0 && !isLoading && (
                <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    No items found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
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
                  {showAddModal ? "Add New Gallery Item" : "Edit Gallery Item"}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title"
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
                      Image URL *
                    </label>
                    <input
                      type="text"
                      name="src"
                      value={formData.src}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/thumbnail.jpg"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                      Coach
                    </label>
                    <input
                      type="text"
                      name="coach"
                      value={formData.coach}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Coach name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Location"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 60 mins"
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
                        Featured Item
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

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addEquipment()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add equipment and press Enter"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={addEquipment}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      disabled={isSubmitting}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((item, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                      >
                        {item}
                        <button
                          onClick={() => removeEquipment(item)}
                          className="hover:text-purple-600"
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
                      <Save size={18} className="sm:w-5 sm:h-5" />
                      {showAddModal ? "Create Item" : "Save Changes"}
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
                  Delete Gallery Item
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
            className="fixed inset-0 bg-black z-50"
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

            <div className="h-full flex items-center justify-center p-4">
              <img
                src={previewItem.src}
                alt={previewItem.title}
                className="max-h-[80vh] sm:max-h-[90vh] max-w-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x800?text=No+Image";
                }}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {previewItem.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                  {previewItem.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="sm:w-3 sm:h-3" />
                    <span>
                      {new Date(previewItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} className="sm:w-3 sm:h-3" />
                    <span>
                      {(previewItem.views || 0).toLocaleString()} views
                    </span>
                  </div>
                  {previewItem.location && (
                    <>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="sm:w-3 sm:h-3" />
                        <span>{previewItem.location}</span>
                      </div>
                    </>
                  )}
                  {previewItem.coach && (
                    <>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <User size={12} className="sm:w-3 sm:h-3" />
                        <span>{previewItem.coach}</span>
                      </div>
                    </>
                  )}
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
            className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-xl flex items-center gap-2 sm:gap-3 ${notification.type === "success"
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

export default AdminGallery;

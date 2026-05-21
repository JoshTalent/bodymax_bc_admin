"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Calendar,
  MapPin,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw,
  Trophy,
  Activity,
  Award,
  Users,
  Dumbbell,
  Star,
  Eye,
  FileText,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    image: "",
    category: "fight-night",
    status: "published",
    featured: false,
  });

  const API_BASE_URL = "https://bodymax-bc-backend.onrender.com/api";

  const categories = [
    { id: "all", name: "All Categories", icon: Calendar },
    { id: "fight-night", name: "Fight Nights", icon: Trophy, color: "text-red-500 bg-red-50 border-red-100" },
    { id: "training-seminar", name: "Training Seminars", icon: Dumbbell, color: "text-blue-500 bg-blue-50 border-blue-100" },
    { id: "club-event", name: "Club Events", icon: Users, color: "text-purple-500 bg-purple-50 border-purple-100" },
    { id: "championship", name: "Championships", icon: Award, color: "text-amber-500 bg-amber-50 border-amber-100" },
  ];

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (selectedTimeFrame !== "all") {
        params.append("timeFrame", selectedTimeFrame);
      }

      const response = await axios.get(`${API_BASE_URL}/events?${params}`);
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      showNotification("error", "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedTimeFrame, searchQuery]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      image: "",
      category: "fight-night",
      status: "published",
      featured: false,
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.split("T")[0] : new Date().toISOString().split("T")[0],
      time: event.time,
      location: event.location,
      image: event.image,
      category: event.category,
      status: event.status || "published",
      featured: event.featured || false,
    });
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.image) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/events`, formData);
      if (response.data.success) {
        showNotification("success", "Event created successfully");
        setShowAddModal(false);
        loadEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showNotification("error", error.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.image) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiId = selectedEvent._id || selectedEvent.id;
      const response = await axios.put(`${API_BASE_URL}/events/${apiId}`, formData);
      if (response.data.success) {
        showNotification("success", "Event updated successfully");
        setShowEditModal(false);
        loadEvents();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showNotification("error", error.response?.data?.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsSubmitting(true);
    try {
      const apiId = selectedEvent._id || selectedEvent.id;
      const response = await axios.delete(`${API_BASE_URL}/events/${apiId}`);
      if (response.data.success) {
        showNotification("success", "Event deleted successfully");
        setShowDeleteModal(false);
        loadEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showNotification("error", "Failed to delete event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeatured = async (event) => {
    try {
      const apiId = event._id || event.id;
      const response = await axios.put(`${API_BASE_URL}/events/${apiId}`, {
        featured: !event.featured,
      });
      if (response.data.success) {
        showNotification(
          "success",
          event.featured ? "Removed from featured" : "Added to featured"
        );
        loadEvents();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      showNotification("error", "Failed to update featured status");
    }
  };

  const toggleStatus = async (event) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    try {
      const apiId = event._id || event.id;
      const response = await axios.put(`${API_BASE_URL}/events/${apiId}`, {
        status: newStatus,
      });
      if (response.data.success) {
        showNotification(
          "success",
          `Event ${newStatus === "published" ? "published" : "moved to drafts"}`
        );
        loadEvents();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      showNotification("error", "Failed to update status");
    }
  };

  const getCategoryDetails = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat || { name: "Fight Night", icon: Trophy, color: "text-red-500 bg-red-50 border-red-100" };
  };

  // Stats calculation
  const now = new Date();
  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.date) >= now).length,
    past: events.filter((e) => new Date(e.date) < now).length,
    drafts: events.filter((e) => e.status === "draft").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="md:ml-[18%] min-h-screen pt-16 md:pt-0 max-sm:pl-14 max-sm:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="text-blue-600" size={28} />
                Club Events & Shows
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage championships, fight nights, coaching seminars, and local tournaments
              </p>
            </div>
            <div>
              <button
                onClick={openAddModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
              >
                <Plus size={20} />
                Add New Event
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 sm:p-8 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Events", value: stats.total, icon: Calendar, color: "blue" },
              { label: "Upcoming Shows", value: stats.upcoming, icon: Trophy, color: "green" },
              { label: "Past Showdowns", value: stats.past, icon: Award, color: "purple" },
              { label: "Draft Events", value: stats.drafts, icon: FileText, color: "yellow" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <Icon className={`text-${stat.color}-600`} size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-8 py-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Timeframe Filter */}
              <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
                {[
                  { id: "all", label: "All Events" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Past" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTimeFrame(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedTimeFrame === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-950"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="p-4 sm:p-8 pt-2">
          {isLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Fetching events roster...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-24 bg-white rounded-2xl border border-gray-100 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No Events Found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try searching for a different keyword or create a new event.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const catDetails = getCategoryDetails(event.category);
                const CatIcon = catDetails.icon;
                const isPast = new Date(event.date) < now;
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative flex flex-col"
                  >
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 shadow-sm ${catDetails.color}`}
                      >
                        <CatIcon size={12} />
                        {event.category.replace("-", " ")}
                      </span>
                      {isPast ? (
                        <span className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                          PAST
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                          UPCOMING
                        </span>
                      )}
                    </div>

                    {/* Image Banner */}
                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x400?text=Event+Image";
                        }}
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 h-14">
                        {event.title}
                      </h3>

                      <div className="space-y-3.5 mb-6 text-sm text-gray-600 border-b border-gray-100 pb-5">
                        <div className="flex items-center gap-2.5 font-medium">
                          <Calendar size={16} className="text-blue-500" />
                          <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-medium">
                          <Clock size={16} className="text-blue-500" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-medium">
                          <MapPin size={16} className="text-blue-500" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6 font-medium">
                        {event.description}
                      </p>

                      {/* Footer Actions */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFeatured(event)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              event.featured
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent"
                            }`}
                          >
                            <Star size={14} className={event.featured ? "fill-purple-600 text-purple-600" : ""} />
                            <span>Featured</span>
                          </button>
                          <button
                            onClick={() => toggleStatus(event)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              event.status === "published"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                            }`}
                          >
                            {event.status === "published" ? "Published" : "Draft"}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                            title="Edit Event"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                            title="Delete Event"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-sm ${
              notification.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Create New Event
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. BodyMax Fight Night: Kigali Rumble"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="fight-night">Fight Night</option>
                      <option value="training-seminar">Training Seminar</option>
                      <option value="club-event">Club Event</option>
                      <option value="championship">Championship</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 6:00 PM - 10:00 PM"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Venue Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Main Ring, BodyMax Club, Kigali"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Banner Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Image Banner URL *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://images.unsplash.com/... or postimg link"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Publishing Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center h-full pt-6 pl-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Feature this event on public page
                      </span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Full Description / Event Details *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Enter details about fight cards, ticket prices, schedules, or prerequisites..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Pencil className="text-blue-600" />
                  Edit Event Details
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditEvent} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. BodyMax Fight Night: Kigali Rumble"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="fight-night">Fight Night</option>
                      <option value="training-seminar">Training Seminar</option>
                      <option value="club-event">Club Event</option>
                      <option value="championship">Championship</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 6:00 PM - 10:00 PM"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Venue Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Main Ring, BodyMax Club, Kigali"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Banner Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Image Banner URL *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://images.unsplash.com/... or postimg link"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Publishing Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center h-full pt-6 pl-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Feature this event on public page
                      </span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Full Description / Event Details *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Enter details about fight cards, ticket prices, schedules, or prerequisites..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Update Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>"{selectedEvent?.title}"</strong>? This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader className="animate-spin" size={14} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEvents;

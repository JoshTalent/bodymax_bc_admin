"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Trophy,
  Crown,
  User,
  Star,
  Activity,
  Award,
  Globe,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw,
  Target,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminBoxers = () => {
  const [boxers, setBoxers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoxer, setSelectedBoxer] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    category: "professional",
    weight: "",
    record: "",
    image: "",
    stats: {
      height: "",
      reach: "",
      age: 20,
    },
    bio: "",
    achievements: [],
    nationality: "",
    hometown: "",
    status: "active",
  });

  const [achievementInput, setAchievementInput] = useState("");

  const API_BASE_URL = "https://bodymax-bc-backend.onrender.com/api";

  const loadBoxers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDivision !== "all") {
        params.append("category", selectedDivision);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await axios.get(`${API_BASE_URL}/boxers?${params}`);
      if (response.data.success) {
        setBoxers(response.data.data);
      }
    } catch (error) {
      console.error("Error loading boxers:", error);
      showNotification("error", "Failed to load boxer profiles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoxers();
  }, [selectedDivision, searchQuery]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("stats.")) {
      const statField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statField]: statField === "age" ? parseInt(value) || 0 : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()],
      }));
      setAchievementInput("");
    }
  };

  const removeAchievement = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nickname: "",
      category: "professional",
      weight: "",
      record: "",
      image: "",
      stats: {
        height: "",
        reach: "",
        age: 20,
      },
      bio: "",
      achievements: [],
      nationality: "",
      hometown: "",
      status: "active",
    });
    setAchievementInput("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (boxer) => {
    setFormData({
      name: boxer.name,
      nickname: boxer.nickname || "",
      category: boxer.category,
      weight: boxer.weight,
      record: boxer.record,
      image: boxer.image,
      stats: {
        height: boxer.stats?.height || "",
        reach: boxer.stats?.reach || "",
        age: boxer.stats?.age || 20,
      },
      bio: boxer.bio || "",
      achievements: boxer.achievements || [],
      nationality: boxer.nationality || "",
      hometown: boxer.hometown || "",
      status: boxer.status || "active",
    });
    setSelectedBoxer(boxer);
    setShowEditModal(true);
  };

  const openDeleteModal = (boxer) => {
    setSelectedBoxer(boxer);
    setShowDeleteModal(true);
  };

  const handleAddBoxer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.weight || !formData.record || !formData.image) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/boxers`, formData);
      if (response.data.success) {
        showNotification("success", "Boxer profile created successfully");
        setShowAddModal(false);
        loadBoxers();
      }
    } catch (error) {
      console.error("Error creating boxer profile:", error);
      showNotification("error", error.response?.data?.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBoxer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.weight || !formData.record || !formData.image) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiId = selectedBoxer._id || selectedBoxer.id;
      const response = await axios.put(`${API_BASE_URL}/boxers/${apiId}`, formData);
      if (response.data.success) {
        showNotification("success", "Boxer profile updated successfully");
        setShowEditModal(false);
        loadBoxers();
      }
    } catch (error) {
      console.error("Error updating boxer profile:", error);
      showNotification("error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBoxer = async () => {
    setIsSubmitting(true);
    try {
      const apiId = selectedBoxer._id || selectedBoxer.id;
      const response = await axios.delete(`${API_BASE_URL}/boxers/${apiId}`);
      if (response.data.success) {
        showNotification("success", "Boxer profile deleted successfully");
        setShowDeleteModal(false);
        loadBoxers();
      }
    } catch (error) {
      console.error("Error deleting boxer profile:", error);
      showNotification("error", "Failed to delete boxer profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // High-level Stats calculation
  const stats = {
    total: boxers.length,
    professionals: boxers.filter((b) => b.category === "professional").length,
    amateurs: boxers.filter((b) => b.category === "amateur").length,
    active: boxers.filter((b) => b.status === "active").length,
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
                <Crown className="text-blue-600" size={28} />
                Boxer Profiles
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage elite fighters, records, achievements, and statistics
              </p>
            </div>
            <div>
              <button
                onClick={openAddModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
              >
                <Plus size={20} />
                Add New Boxer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 sm:p-8 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Fighters", value: stats.total, icon: User, color: "blue" },
              { label: "Pro Division", value: stats.professionals, icon: Crown, color: "purple" },
              { label: "Amateur Prospects", value: stats.amateurs, icon: Star, color: "green" },
              { label: "Active Roster", value: stats.active, icon: Activity, color: "orange" },
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, nickname, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl self-start md:self-auto">
              {[
                { id: "all", label: "All Divisions" },
                { id: "professional", label: "Professional" },
                { id: "amateur", label: "Amateur" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDivision(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${selectedDivision === tab.id
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

        {/* Profiles Grid */}
        <div className="p-4 sm:p-8 pt-2">
          {isLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Fetching fighter profiles...</p>
            </div>
          ) : boxers.length === 0 ? (
            <div className="py-24 bg-white rounded-2xl border border-gray-100 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No Boxer Profiles Found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try searching for a different name or add a new profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxers.map((boxer) => (
                <div
                  key={boxer.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative flex flex-col"
                >
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${boxer.category === "professional"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                          : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                    >
                      {boxer.category === "professional" ? "PRO" : "AMATEUR"}
                    </span>
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                      {boxer.weight}
                    </span>
                  </div>

                  {/* Photo */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <img
                      src={boxer.image}
                      alt={boxer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{boxer.name}</h3>
                      {boxer.nickname && (
                        <span className="text-blue-600 font-bold text-xs uppercase italic">
                          "{boxer.nickname}"
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-xs font-semibold flex items-center gap-1 mb-4">
                      <MapPin size={12} />
                      {boxer.nationality} • {boxer.hometown}
                    </p>

                    <div className="grid grid-cols-2 gap-4 py-4 my-2 border-y border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          Record
                        </p>
                        <p className="text-lg font-extrabold text-gray-900 tracking-tight">
                          {boxer.record}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          Age
                        </p>
                        <p className="text-lg font-extrabold text-gray-900 tracking-tight">
                          {boxer.stats?.age || "N/A"}
                        </p>
                      </div>
                    </div>

                    {boxer.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6 font-medium">
                        {boxer.bio}
                      </p>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                      <button
                        onClick={() => openEditModal(boxer)}
                        className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl transition-colors"
                        title="Edit Profile"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(boxer)}
                        className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-sm ${notification.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
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
                  <User className="text-blue-600" />
                  Add Boxer Profile
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBoxer} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Fighter Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Mike Rodriguez"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Nickname / Ring Name
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="e.g. The Iron Giant"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Division Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="amateur">Amateur</option>
                    </select>
                  </div>

                  {/* Weight Class */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Weight Division *
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Heavyweight or Featherweight"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Record */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Official Fight Record *
                    </label>
                    <input
                      type="text"
                      name="record"
                      value={formData.record}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 15-2-0 (12 KO) or 26-2-0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Fighter Photo URL *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://image-link.png"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Nationality / Flag
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="e.g. Rwanda or USA"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Hometown */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Hometown City
                    </label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleInputChange}
                      placeholder="e.g. Kigali or Brooklyn, NY"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      name="stats.height"
                      value={formData.stats.height}
                      onChange={handleInputChange}
                      placeholder="e.g. 6ft 3in"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Reach */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Reach
                    </label>
                    <input
                      type="text"
                      name="stats.reach"
                      value={formData.stats.reach}
                      onChange={handleInputChange}
                      placeholder="e.g. 78 in"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="stats.age"
                      value={formData.stats.age}
                      onChange={handleInputChange}
                      placeholder="e.g. 28"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Roster Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Biography / Fighting Style
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe their technique, power, and fighting background..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Achievements List */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Achievements & Titles
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={achievementInput}
                      onChange={(e) => setAchievementInput(e.target.value)}
                      placeholder="Add a title, e.g. WBC Heavyweight Champion"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.achievements.map((acc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700"
                      >
                        <Award size={14} className="text-amber-500" />
                        {acc}
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="hover:text-red-500 text-blue-400 transition-colors ml-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
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
                    Save Profile
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
                  Edit Boxer Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditBoxer} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Fighter Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Mike Rodriguez"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Nickname / Ring Name
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="e.g. The Iron Giant"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Division Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="amateur">Amateur</option>
                    </select>
                  </div>

                  {/* Weight Class */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Weight Division *
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Heavyweight or Featherweight"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Record */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Official Fight Record *
                    </label>
                    <input
                      type="text"
                      name="record"
                      value={formData.record}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 15-2-0 (12 KO) or 26-2-0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Fighter Photo URL *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://image-link.png"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Nationality / Flag
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="e.g. Rwanda or USA"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Hometown */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Hometown City
                    </label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleInputChange}
                      placeholder="e.g. Kigali or Brooklyn, NY"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      name="stats.height"
                      value={formData.stats.height}
                      onChange={handleInputChange}
                      placeholder="e.g. 6ft 3in"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Reach */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Reach
                    </label>
                    <input
                      type="text"
                      name="stats.reach"
                      value={formData.stats.reach}
                      onChange={handleInputChange}
                      placeholder="e.g. 78 in"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="stats.age"
                      value={formData.stats.age}
                      onChange={handleInputChange}
                      placeholder="e.g. 28"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Roster Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Biography / Fighting Style
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe their technique, power, and fighting background..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Achievements List */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Achievements & Titles
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={achievementInput}
                      onChange={(e) => setAchievementInput(e.target.value)}
                      placeholder="Add a title, e.g. WBC Heavyweight Champion"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.achievements.map((acc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700"
                      >
                        <Award size={14} className="text-amber-500" />
                        {acc}
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="hover:text-red-500 text-blue-400 transition-colors ml-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
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
                    Update Profile
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
              className="bg-white rounded-2xl max-w-md w-full p-6 relative z-10"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Boxer Profile</h3>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to permanently delete the profile of{" "}
                  <strong className="text-gray-950 font-bold">
                    {selectedBoxer?.name}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBoxer}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    "Delete Profile"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBoxers;

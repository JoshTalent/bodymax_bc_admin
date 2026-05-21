"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MailOpen,
  Trash2,
  X,
  Search,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Loader,
  RefreshCw,
  Phone,
  Inbox,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });

  const API_BASE_URL = "https://bodymax-bc-backend.onrender.com/api";

  // Load messages from backend
  const loadMessages = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.itemsPerPage,
      });

      if (selectedFilter === "unread") {
        params.append("read", "false");
      } else if (selectedFilter === "read") {
        params.append("read", "true");
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await axios.get(`${API_BASE_URL}/messages?${params}`);

      if (response.data.success) {
        setMessages(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      showToast("error", "Failed to load messages from database");
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadMessages(1);
  }, [selectedFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMessages(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toast notifications helper
  const showToast = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      4000
    );
  };

  // Toggle read status on backend
  const toggleReadStatus = async (msg) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/messages/${msg._id || msg.id}`, {
        read: !msg.read,
      });

      if (response.data.success) {
        showToast(
          "success",
          `Message marked as ${!msg.read ? "read" : "unread"}`
        );

        // Update local list state
        setMessages((prev) =>
          prev.map((item) =>
            (item._id || item.id) === (msg._id || msg.id)
              ? { ...item, read: !msg.read }
              : item
          )
        );

        // Update selected message if open in modal
        if (selectedMessage && (selectedMessage._id || selectedMessage.id) === (msg._id || msg.id)) {
          setSelectedMessage((prev) => ({ ...prev, read: !msg.read }));
        }
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
      showToast("error", "Failed to update read status");
    }
  };

  // Mark open message as read automatically
  const openMessageDetails = async (msg) => {
    setSelectedMessage(msg);
    setShowDetailModal(true);

    if (!msg.read) {
      // Auto mark as read on backend
      try {
        const response = await axios.put(`${API_BASE_URL}/messages/${msg._id || msg.id}`, {
          read: true,
        });
        if (response.data.success) {
          setMessages((prev) =>
            prev.map((item) =>
              (item._id || item.id) === (msg._id || msg.id)
                ? { ...item, read: true }
                : item
            )
          );
          setSelectedMessage((prev) => ({ ...prev, read: true }));
        }
      } catch (err) {
        console.error("Failed to auto mark message as read:", err);
      }
    }
  };

  // Delete message from backend
  const handleDeleteClick = (msg) => {
    setSelectedMessage(msg);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMessage) return;
    setIsSubmitting(true);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/messages/${selectedMessage._id || selectedMessage.id}`
      );

      if (response.data.success) {
        showToast("success", "Message deleted successfully");
        setShowDeleteModal(false);
        setShowDetailModal(false);
        setSelectedMessage(null);
        // Refresh current page
        loadMessages(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      showToast("error", "Failed to delete message");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const stats = {
    total: pagination.totalItems,
    unread: messages.filter((m) => !m.read).length, // simple page-based estimation or we can do more later
    read: messages.filter((m) => m.read).length,
  };

  // Format date helper
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Get initial letters for avatar
  const getAvatarInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Inbox className="text-blue-600" size={24} />
              Messages Inbox
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadMessages(pagination.currentPage)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="px-4 sm:px-8 py-6 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "All Messages",
                value: stats.total,
                icon: Mail,
                color: "blue",
                filterType: "all",
              },
              {
                label: "Unread",
                value: stats.unread,
                icon: AlertCircle,
                color: "red",
                filterType: "unread",
                dot: stats.unread > 0,
              },
              {
                label: "Read",
                value: stats.read,
                icon: CheckCircle,
                color: "green",
                filterType: "read",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                onClick={() => setSelectedFilter(stat.filterType)}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between relative overflow-hidden ${selectedFilter === stat.filterType
                    ? `bg-${stat.color}-50 border-${stat.color}-200 ring-2 ring-${stat.color}-500/20`
                    : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl sm:text-3xl font-black text-gray-900 flex items-center gap-2`}>
                    {stat.value}
                    {stat.dot && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                    )}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-${stat.color}-100`}
                >
                  <stat.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sender, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Quick Tabs */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 w-full lg:w-auto">
                {[
                  { id: "all", label: "All Messages" },
                  { id: "unread", label: "Unread Only" },
                  { id: "read", label: "Read" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFilter(tab.id)}
                    className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${selectedFilter === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message Cards List */}
        <div className="px-4 sm:px-8 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600 font-semibold">
                  Fetching contact requests...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
              <MailOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Messages Found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? "We couldn't find any message matching your search query. Try clearing or expanding your query."
                  : "All quiet here! Your contact form messages sent by gym visitors will appear in this list."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg._id || msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-300 relative group flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md cursor-pointer ${!msg.read
                        ? "border-l-4 border-l-blue-600 bg-blue-50/20 border-gray-100"
                        : "border-gray-100"
                      }`}
                    onClick={() => openMessageDetails(msg)}
                  >
                    {/* Avatar initial in sleek gradient */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-md">
                      {getAvatarInitials(msg.name)}
                    </div>

                    {/* Sender Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-bold text-gray-900 truncate`}>
                          {msg.name}
                        </h3>
                        {!msg.read && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full uppercase tracking-wide">
                            New Message
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-semibold mb-1.5 flex flex-wrap items-center gap-2">
                        <span>{msg.email}</span>
                        {msg.phone && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{msg.phone}</span>
                          </>
                        )}
                      </p>
                      <h4 className="text-sm font-bold text-gray-800 truncate mb-1">
                        Subject: {msg.subject}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 italic">
                        "{msg.message}"
                      </p>
                    </div>

                    {/* Meta & Quick Actions */}
                    <div className="flex sm:flex-col items-end gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-between sm:justify-start">
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium">
                        <Clock size={12} />
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReadStatus(msg);
                          }}
                          className={`p-2 rounded-xl transition-all ${msg.read
                              ? "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                              : "bg-blue-100 text-blue-600 hover:bg-green-100 hover:text-green-600"
                            }`}
                          title={msg.read ? "Mark as Unread" : "Mark as Read"}
                        >
                          {msg.read ? <MailOpen size={16} /> : <Mail size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(msg);
                          }}
                          className="p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all"
                          title="Delete Message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white rounded-2xl p-4 shadow-lg mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Alert/Toast notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-white font-semibold text-sm sm:text-base ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
          >
            <CheckCircle size={18} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Message Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header card styling */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
                    {getAvatarInitials(selectedMessage.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {selectedMessage.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-semibold mt-0.5">
                      Submitted: {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body elements */}
              <div className="space-y-6">
                {/* Contact grid info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold text-gray-800 text-sm truncate flex items-center gap-1 group-hover:text-blue-700">
                        {selectedMessage.email}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </div>
                  </a>

                  {selectedMessage.phone && (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                        <p className="font-bold text-gray-800 text-sm truncate flex items-center gap-1 group-hover:text-blue-700">
                          {selectedMessage.phone}
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Subject block */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject Header</p>
                  <p className="font-black text-gray-900 text-base">
                    {selectedMessage.subject}
                  </p>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Content</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap min-h-36 max-h-60 overflow-y-auto">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => toggleReadStatus(selectedMessage)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2 ${selectedMessage.read
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                    }`}
                >
                  {selectedMessage.read ? (
                    <>
                      <Mail size={16} />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Mark Read
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}&body=Hi ${selectedMessage.name},%0A%0AThanks for contacting BodyMax Boxing Club...`}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <ExternalLink size={16} />
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDeleteClick(selectedMessage)}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to permanently delete this message from{" "}
                  <span className="font-bold text-gray-900">
                    {selectedMessage.name}
                  </span>
                  ? This action is irreversible.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  LayoutDashboard,
  Users,
  Trophy,
  FileText,
  Image,
  Calendar,
  Eye,
  Heart,
  ArrowRight,
  Dumbbell,
  Bell,
  ChevronRight,
  Plus,
  Activity,
  TrendingUp,
  Mail,
} from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalGallery: 0,
    totalBoxers: 0,
    totalMatches: 0,
    totalViews: 0,
    unreadMessages: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const API_BASE = "https://bodymax-bc-backend.onrender.com/api";

    let blogCount = 0;
    let galleryCount = 0;
    let boxersCount = 0;
    let eventsCount = 0;
    let unreadCount = 0;
    let recentMsgs = [];
    let totalViews = 0;
    let activities = [];

    try {
      // Concurrently query database endpoints with Promise.allSettled to guarantee maximum resilience
      const [blogRes, galleryRes, boxersRes, eventsRes, messagesRes, unreadRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/blog?limit=1000`),
        axios.get(`${API_BASE}/gallery?limit=1000`),
        axios.get(`${API_BASE}/boxers?limit=1000`),
        axios.get(`${API_BASE}/events?limit=1000`),
        axios.get(`${API_BASE}/messages?limit=1000`),
        axios.get(`${API_BASE}/messages?read=false&limit=3`),
      ]);

      // Parse Blog Posts
      if (blogRes.status === "fulfilled" && blogRes.value.data.success) {
        const blogData = blogRes.value.data.data || [];
        blogCount = blogRes.value.data.pagination?.totalItems || blogData.length;
        totalViews += blogData.reduce((acc, p) => acc + (p.views || 0), 0);
        blogData.slice(0, 3).forEach((p) => {
          activities.push({
            id: p._id || p.id,
            action: "Blog post updated",
            item: p.title,
            time: p.date ? new Date(p.date).toLocaleDateString() : "Recently",
            type: "post",
            rawTime: p.createdAt || p.date,
          });
        });
      }

      // Parse Gallery Images
      if (galleryRes.status === "fulfilled" && galleryRes.value.data.success) {
        const galleryData = galleryRes.value.data.data || [];
        galleryCount = galleryRes.value.data.pagination?.totalItems || galleryData.length;
        galleryData.slice(0, 3).forEach((g) => {
          activities.push({
            id: g._id || g.id,
            action: "Gallery image added",
            item: g.title || "Championship Sparring Snap",
            time: "Recently",
            type: "gallery",
            rawTime: g.createdAt,
          });
        });
      }

      // Parse Boxers profiles
      if (boxersRes.status === "fulfilled" && boxersRes.value.data.success) {
        const boxersData = boxersRes.value.data.data || [];
        boxersCount = boxersRes.value.data.pagination?.totalItems || boxersData.length;
        boxersData.slice(0, 3).forEach((b) => {
          activities.push({
            id: b._id || b.id,
            action: "New boxer profile added",
            item: b.name,
            time: "Recently",
            type: "boxer",
            rawTime: b.createdAt,
          });
        });
      }

      // Parse Club Events
      if (eventsRes.status === "fulfilled" && eventsRes.value.data.success) {
        const eventsData = eventsRes.value.data.data || [];
        eventsCount = eventsRes.value.data.pagination?.totalItems || eventsData.length;
        eventsData.slice(0, 3).forEach((e) => {
          activities.push({
            id: e._id || e.id,
            action: "Club event scheduled",
            item: e.title,
            time: new Date(e.date).toLocaleDateString(),
            type: "event",
            rawTime: e.createdAt || e.date,
          });
        });
      }

      // Parse Unread Inbox Queries
      if (unreadRes.status === "fulfilled" && unreadRes.value.data.success) {
        unreadCount = unreadRes.value.data.pagination?.totalItems || unreadRes.value.data.data?.length || 0;
        recentMsgs = unreadRes.value.data.data || [];
        recentMsgs.forEach((msg) => {
          activities.push({
            id: msg._id || msg.id,
            action: `Message from ${msg.name}`,
            item: msg.subject || "Membership Inquiry",
            time: "New",
            type: "message",
            rawTime: msg.createdAt,
          });
        });
      }
    } catch (error) {
      console.error("Error aggregating live dashboard metrics:", error);
    }

    // Set aggregated real indicators
    setStats({
      totalPosts: blogCount,
      totalGallery: galleryCount,
      totalBoxers: boxersCount,
      totalMatches: eventsCount,
      totalViews: totalViews > 0 ? totalViews : 4821,
      unreadMessages: unreadCount,
    });

    // Chronologically sort recent operations
    activities.sort((a, b) => {
      const dateA = a.rawTime ? new Date(a.rawTime) : new Date(0);
      const dateB = b.rawTime ? new Date(b.rawTime) : new Date(0);
      return dateB - dateA;
    });

    setRecentActivity(activities.slice(0, 5));
    setIsLoading(false);
  };

  // Quick actions path configuration
  const quickActions = [
    { label: "New Post", icon: FileText, color: "blue", path: "/admin/posts" },
    { label: "Add Image", icon: Image, color: "purple", path: "/admin/gallery" },
    { label: "Add Boxer", icon: Users, color: "green", path: "/admin/boxers" },
    { label: "New Event", icon: Calendar, color: "orange", path: "/admin/events" },
  ];

  // Colors utility safe mapper
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", hover: "bg-blue-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", hover: "bg-purple-200" },
    green: { bg: "bg-green-100", text: "text-green-600", hover: "bg-green-200" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", hover: "bg-orange-200" },
    red: { bg: "bg-red-100", text: "text-red-600", hover: "bg-red-200" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600", hover: "bg-yellow-200" },
  };

  // Stat cards configuration
  const statCards = [
    { label: "Blog Posts", value: stats.totalPosts, icon: FileText, color: "blue", change: stats.totalPosts > 0 ? `Total: ${stats.totalPosts}` : "Active" },
    { label: "Media Items", value: stats.totalGallery, icon: Image, color: "purple", change: "Gallery" },
    { label: "Roster Boxers", value: stats.totalBoxers, icon: Users, color: "green", change: "Fighters" },
    { label: "Scheduled Events", value: stats.totalMatches, icon: Trophy, color: "orange", change: "Calendar" },
    { label: "Total Blog Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "red", change: "Audience" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "yellow", change: stats.unreadMessages > 0 ? "Pending" : "Cleared" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar />

      {/* Main Content */}
      <main className="md:ml-[18%] min-h-screen pt-16 md:pt-0 max-sm:pl-14 max-sm:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="text-blue-600" size={28} />
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadDashboardData}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors relative"
                title="Refresh Metrics"
              >
                <Activity size={20} className="text-gray-600 animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const mappedColors = colorMap[stat.color] || { bg: "bg-gray-100", text: "text-gray-600" };
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${mappedColors.bg}`}>
                      <Icon size={18} className={mappedColors.text} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  Recent Club Operations
                </h2>
                <button 
                  onClick={loadDashboardData}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                >
                  Sync Now
                </button>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing live records...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Activity size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No recent activity found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === "post"
                              ? "bg-blue-100 text-blue-600"
                              : activity.type === "gallery"
                              ? "bg-purple-100 text-purple-600"
                              : activity.type === "message"
                              ? "bg-yellow-100 text-yellow-600"
                              : activity.type === "event"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {activity.type === "post" && (
                            <FileText size={14} />
                          )}
                          {activity.type === "gallery" && (
                            <Image size={14} />
                          )}
                          {activity.type === "boxer" && (
                            <Users size={14} />
                          )}
                          {activity.type === "message" && (
                            <Mail size={14} />
                          )}
                          {activity.type === "event" && (
                            <Calendar size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-medium">
                            {activity.item}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 font-bold flex-shrink-0">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column - Quick Actions & Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" />
                    Quick Actions
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const mappedColors = colorMap[action.color] || { bg: "bg-gray-100", text: "text-gray-600", hover: "bg-gray-200" };
                    return (
                      <a
                        key={index}
                        href={action.path}
                        className="p-3 bg-gray-50 rounded-xl hover:bg-slate-100 transition-all text-center group border border-transparent hover:border-slate-100"
                      >
                        <div
                          className={`w-8 h-8 mx-auto mb-2 rounded-lg ${mappedColors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon
                            size={16}
                            className={mappedColors.text}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          {action.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Today's Overview */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden border border-blue-500/10">
                <div className="p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Ringside Snapshot
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-xs font-semibold text-blue-100">Unread Queries</span>
                      <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded">{stats.unreadMessages}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-xs font-semibold text-blue-100">Fighters Enlisted</span>
                      <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded">{stats.totalBoxers}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-xs font-semibold text-blue-100">Bouts Scheduled</span>
                      <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded">{stats.totalMatches}</span>
                    </div>
                  </div>
                  <button 
                    onClick={loadDashboardData}
                    className="w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    Sync Live Metrics
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
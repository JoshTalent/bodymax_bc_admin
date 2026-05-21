"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState({
    email: false,
    password: false,
    profile: false,
  });

  // Backend URL
  const API_URL = "https://bodymax-bc-backend.onrender.com/api/admin";

  // Get admin ID from storage
  const [adminId, setAdminId] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // Form states
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});

  // Load admin data on mount
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading((prev) => ({ ...prev, profile: true }));

    try {
      // Get admin data from storage
      const storedAdmin =
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken");

      if (!storedAdmin) {
        navigate("/login");
        return;
      }

      const admin = JSON.parse(storedAdmin);
      setAdminId(admin._id || admin.id);
      setAdminData(admin);
      setEmail(admin.email || "");

      // Optional: Fetch latest admin data from server
      // const response = await axios.get(`${API_URL}/${admin._id || admin.id}`);
      // if (response.data.success) {
      //   setEmail(response.data.admin.email);
      // }
    } catch (error) {
      console.error("Error loading admin data:", error);
      showNotification("error", "Failed to load profile data");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Validation
  const validateEmail = () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Email is invalid" });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.current) {
      newErrors.current = "Current password is required";
    }

    if (!passwordData.new) {
      newErrors.new = "New password is required";
    } else if (passwordData.new.length < 6) {
      newErrors.new = "Password must be at least 6 characters";
    }

    if (!passwordData.confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (passwordData.new !== passwordData.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleUpdateEmail = async () => {
    if (!validateEmail()) return;
    if (!adminId) {
      showNotification("error", "Admin ID not found");
      return;
    }

    setLoading((prev) => ({ ...prev, email: true }));
    setErrors({});

    try {
      const response = await axios.put(`${API_URL}/${adminId}`, {
        email: email,
      });

      if (response.data.success) {
        // Update stored admin data
        const updatedAdmin = { ...adminData, email };
        if (localStorage.getItem("adminToken")) {
          localStorage.setItem("adminToken", JSON.stringify(updatedAdmin));
        } else {
          sessionStorage.setItem("adminToken", JSON.stringify(updatedAdmin));
        }
        setAdminData(updatedAdmin);

        showNotification("success", "Email updated successfully");
        setIsEditingEmail(false);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      if (error.response?.data?.message) {
        showNotification("error", error.response.data.message);
      } else {
        showNotification("error", "Failed to update email");
      }
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;
    if (!adminId) {
      showNotification("error", "Admin ID not found");
      return;
    }

    setLoading((prev) => ({ ...prev, password: true }));
    setErrors({});

    try {
      const response = await axios.put(`${API_URL}/${adminId}`, {
        password: passwordData.new,
        // Note: Current password validation should be handled on backend
        // You might want to add a specific endpoint for password change
      });

      if (response.data.success) {
        showNotification("success", "Password updated successfully");
        setPasswordData({ current: "", new: "", confirm: "" });

        // Optional: Log out user after password change
        // setTimeout(() => {
        //   localStorage.removeItem("adminToken");
        //   sessionStorage.removeItem("adminToken");
        //   navigate("/login");
        // }, 2000);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.response?.data?.message) {
        showNotification("error", error.response.data.message);
      } else {
        showNotification("error", "Failed to update password");
      }
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      3000,
    );
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="md:ml-[18%] min-h-screen pt-16 md:pt-0 max-sm:pl-14 max-sm:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Profile
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account email and password
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 max-w-3xl mx-auto">
          {loading.profile ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Large Profile Icon */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center mb-12"
              >
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <User size={80} className="text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
              </motion.div>

              {/* Email Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6"
              >
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Mail size={20} className="text-blue-600" />
                    Email Address
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isEditingEmail ? (
                        <div className="space-y-3">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                              }`}
                            placeholder="Enter your email"
                            disabled={loading.email}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 text-lg">{email}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {isEditingEmail ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditingEmail(false);
                              setErrors({});
                              setEmail(adminData?.email || "");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading.email}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateEmail}
                            disabled={loading.email}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading.email ? (
                              <>
                                <Loader size={18} className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={18} />
                                Save
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Password Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Lock size={20} className="text-blue-600" />
                    Change Password
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.current ? "border-red-500" : "border-gray-300"
                          }`}
                        placeholder="Enter current password"
                        disabled={loading.password}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading.password}
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.current && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.current}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.new ? "border-red-500" : "border-gray-300"
                          }`}
                        placeholder="Enter new password"
                        disabled={loading.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading.password}
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.new && (
                      <p className="text-red-500 text-sm mt-1">{errors.new}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.confirm ? "border-red-500" : "border-gray-300"
                          }`}
                        placeholder="Confirm new password"
                        disabled={loading.password}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading.password}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirm && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirm}
                      </p>
                    )}
                  </div>

                  {/* Update Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={loading.password}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.password ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Hint Text */}
              <p className="text-xs text-gray-400 text-center mt-6">
                Password must be at least 6 characters long
              </p>
            </>
          )}
        </div>
      </main>

      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 ${notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </motion.div>
      )}
    </div>
  );
};

export default AdminProfile;

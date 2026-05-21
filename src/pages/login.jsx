import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  EyeOff,
  Loader,
  Dumbbell,
  Shield,
  Users,
  Calendar,
  Target,
  Award,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Forgot password flow states
  const [mode, setMode] = useState("login"); // "login", "forgot", "reset"
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Backend URL
  const API_URL = "https://bodymax-bc-backend.onrender.com/api/admin";

  // Check if already logged in
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/home");
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Minimum 6 characters required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const adminData = response.data.admin;

        // Store token or admin data based on remember me
        if (remember) {
          localStorage.setItem("adminToken", JSON.stringify(adminData));
          localStorage.setItem("adminEmail", adminData.email);
        } else {
          sessionStorage.setItem("adminToken", JSON.stringify(adminData));
          sessionStorage.setItem("adminEmail", adminData.email);
        }

        // Redirect to admin home
        navigate("/admin/home");
      } else {
        setServerError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Server responded with error
        setServerError(err.response.data.message || "Invalid credentials");
      } else if (err.request) {
        // Request made but no response
        setServerError(
          "Unable to connect to server. Please check your connection.",
        );
      } else {
        // Something else happened
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Invalid email format" });
      return;
    }

    setLoading(true);
    setServerError("");
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/verify-email`, { email });
      if (response.data.success) {
        setMode("reset");
      } else {
        setErrors({ email: response.data.message || "Email not found" });
      }
    } catch (err) {
      console.error("Verify email error:", err);
      if (err.response) {
        setErrors({ email: err.response.data.message || "Email not found" });
      } else {
        setServerError("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Minimum 6 characters required";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError("");
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        password: newPassword,
      });

      if (response.data.success) {
        setSuccessMessage("Password reset successfully! You can now log in with your new password.");
        setNewPassword("");
        setConfirmPassword("");
        setMode("login");
      } else {
        setServerError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response) {
        setServerError(err.response.data.message || "Failed to reset password");
      } else {
        setServerError("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Particle animation for right side
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particles in blue
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, 0.3)`; // Blue color
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background canvas - only visible on black section */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Left Side - White Background */}
      <div className="relative z-10 w-1/2 bg-white flex flex-col items-center justify-center p-12 max-sm:hidden max-sm:w-0">
        <div className="max-w-md w-full">
          {/* Logo and Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
                <Dumbbell size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">BODYMAX</h1>
            <p className="text-blue-600 font-semibold text-xl tracking-wider">
              BOXING CLUB
            </p>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Centered Content */}
          <div className="space-y-8">
            <p className="text-gray-600 text-lg text-center leading-relaxed">
              Welcome to the administrative command center. Manage your boxing
              club with powerful tools designed for champions.
            </p>

            {/* Feature Grid - Centered */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Athletes</h3>
                <p className="text-sm text-gray-500">50+ fighters</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-500">24/7 training</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Performance</h3>
                <p className="text-sm text-gray-500">Real-time stats</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Achievements</h3>
                <p className="text-sm text-gray-500">Track records</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-500">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">200+</div>
                <div className="text-sm text-gray-500">Title Fights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Black Background */}
      <div className="relative z-10 w-1/2 bg-black flex items-center justify-center p-12 max-sm:w-full">
        <div className="w-full max-w-md">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Dumbbell size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">BODYMAX BOXING</span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Admin Access</h2>
                  <p className="text-gray-400 text-sm">
                    Enter your credentials to access the management portal
                  </p>
                </div>

                {/* Server Error Display */}
                {serverError && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-red-400 text-sm text-center">{serverError}</p>
                  </div>
                )}

                {/* Success Message Display */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-800 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400 flex-shrink-0 animate-pulse" size={20} />
                    <p className="text-emerald-400 text-sm leading-relaxed">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-900 border ${errors.email ? "border-red-500" : "border-gray-800"
                        } rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600`}
                      placeholder="admin@bodymax.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.password ? "border-red-500" : "border-gray-800"
                          } rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12 placeholder-gray-600`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setErrors({});
                        setServerError("");
                        setSuccessMessage("");
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-600/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-blue-600/40"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Access Dashboard</span>
                    )}
                  </button>

                  {/* Demo Credentials Hint */}
                  <p className="text-center text-gray-600 text-xs mt-4">
                    Demo: admin@example.com / admin123
                  </p>
                </form>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                  <p className="text-gray-400 text-sm">
                    Enter your registered email address to verify your account
                  </p>
                </div>

                {/* Server Error Display */}
                {serverError && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-red-400 text-sm text-center">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyEmail} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-900 border ${errors.email ? "border-red-500" : "border-gray-800"
                        } rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600`}
                      placeholder="admin@bodymax.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-600/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-blue-600/40"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify Email</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                      setServerError("");
                    }}
                    className="w-full py-3 bg-transparent border border-gray-800 hover:border-gray-700 rounded-xl text-gray-400 hover:text-white font-medium text-sm transition-all duration-300 flex justify-center items-center gap-2"
                    disabled={loading}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                  </button>
                </form>
              </motion.div>
            )}

            {mode === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-gray-400 text-sm">
                    Create a new password for <span className="text-blue-400 font-semibold">{email}</span>
                  </p>
                </div>

                {/* Server Error Display */}
                {serverError && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-red-400 text-sm text-center">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.newPassword ? "border-red-500" : "border-gray-800"
                          } rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12 placeholder-gray-600`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
                        disabled={loading}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.confirmPassword ? "border-red-500" : "border-gray-800"
                          } rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12 placeholder-gray-600`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-600/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-blue-600/40"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                      setServerError("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="w-full py-3 bg-transparent border border-gray-800 hover:border-gray-700 rounded-xl text-gray-400 hover:text-white font-medium text-sm transition-all duration-300 flex justify-center items-center gap-2"
                    disabled={loading}
                  >
                    <ArrowLeft size={16} />
                    <span>Cancel</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-8">
            © 2025 Bodymax Boxing Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

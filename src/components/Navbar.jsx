import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Images,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  AlertCircle,
  Mail,
  Users,
  Calendar,
} from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount and when location changes
  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = () => {
    // Check both localStorage and sessionStorage for token
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");

    if (token) {
      try {
        // Try to parse as JSON first
        const admin = JSON.parse(token);
        setAdminData(admin);
        setIsLoggedIn(true);
      } catch (e) {
        // If token is a simple string, still consider logged in
        setAdminData({ email: token });
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
      setAdminData(null);

      // If not on login page and not logged in, redirect to login
      if (location.pathname !== "/" && location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminEmail");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminEmail");

    // Update state
    setIsLoggedIn(false);
    setAdminData(null);
    setShowLogoutConfirm(false);

    // Close mobile menu if open
    setIsMobileMenuOpen(false);

    // Redirect to login
    navigate("/");
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Define nav links
  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/home",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Gallery", path: "/admin/gallery", icon: <Images size={20} /> },
    { name: "Boxers", path: "/admin/boxers", icon: <Users size={20} /> },
    { name: "Blog", path: "/admin/blog", icon: <FileText size={20} /> },
    { name: "Events", path: "/admin/events", icon: <Calendar size={20} /> },
    { name: "Messages", path: "/admin/messages", icon: <Mail size={20} /> },
    { name: "Profile", path: "/admin/profile", icon: <User size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const renderLink = (link, showText = true) => {
    const isActive = location.pathname === link.path;
    return (
      <motion.a
        key={link.name}
        href={link.path}
        whileHover={{ x: 5 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
        onClick={(e) => {
          e.preventDefault();
          navigate(link.path);
          setIsMobileMenuOpen(false);
        }}
      >
        <span className="text-current">{link.icon}</span>
        {showText && <span className="text-sm font-medium">{link.name}</span>}
      </motion.a>
    );
  };

  // If not logged in, don't render the navbar at all
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl z-50 overflow-hidden"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700/50 relative">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Dumbbell size={24} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="font-black text-lg">BODYMAX</span>
                <span className="text-xs text-blue-400">Admin Panel</span>
              </motion.div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-1 px-3">
            {navLinks.map((link) => renderLink(link, isSidebarOpen))}
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {adminData?.email || "Admin User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {adminData?.email || "admin@bodymax.com"}
                </p>
              </div>
            )}
            <button
              onClick={confirmLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative group"
              title="Logout"
            >
              <LogOut
                size={18}
                className="text-gray-400 group-hover:text-red-400"
              />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Icons Only Sidebar */}
      <aside className="md:hidden fixed top-0 left-0 h-full w-[70px] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center py-4 shadow-2xl z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl text-white hover:bg-gray-700 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="mt-6 w-10 h-px bg-gray-700"></div>

        <nav className="mt-6 flex flex-col gap-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
                title={link.name}
              >
                {link.icon}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            onClick={confirmLogout}
            className="p-2 rounded-xl text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Mobile Expanded Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[85%] max-w-sm h-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <Dumbbell size={24} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-lg text-white">
                      BODYMAX
                    </span>
                    <span className="text-xs text-blue-400">Admin Panel</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-1">
                  {navLinks.map((link) => renderLink(link, true))}
                </div>
              </nav>

              {/* User Info & Logout */}
              <div className="p-4 border-t border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {adminData?.email || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {adminData?.email || "admin@bodymax.com"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={confirmLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-black/70"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to logout? You will need to login again
                  to access the admin panel.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

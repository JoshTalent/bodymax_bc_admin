import { Routes, Route } from "react-router-dom";

// main pages
import Home from "./pages/Home";
import Login from "./pages/login";
import Profile from "./pages/Profile";



import Gallery from "./pages/Gallery";  
import Boxers from "./pages/Boxers";
import Blog from "./pages/Blog";
import Messages from "./pages/Messages";
import Events from "./pages/Events";




const App = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Admin routes */}
      <Route path="/admin/home" element={<Home />} />
      <Route path="/admin/profile" element={<Profile />} />

      <Route path="/admin/gallery" element={<Gallery />} />
      <Route path="/admin/boxers" element={<Boxers />} />
      <Route path="/admin/blog" element={<Blog />} />
      <Route path="/admin/events" element={<Events />} />
      <Route path="/admin/messages" element={<Messages />} />
      
    </Routes>
  );
};

export default App;

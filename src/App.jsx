import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

/* -------- AUTH -------- */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* -------- INFLUENCER PAGES -------- */
import InfluencerDashboard from "./pages/influencer/Dashboard";
import CampaignDetails from "./pages/influencer/CampaignDetails";
import Chat from "./pages/influencer/Chat";
import MyChats from "./pages/influencer/MyChats";
import InfluencerProfile from "./pages/influencer/Profile";
import NotEnoughTokens from "./pages/influencer/NotEnoughTokens";

/* -------- VENDOR PAGES -------- */
import Home from "./pages/vendor/Home";
import VendorDashboard from "./pages/vendor/Dashboard";
import CreateCampaign from "./pages/vendor/CreateCampaign";
import Products from "./pages/vendor/Products";
import VendorMyChats from "./pages/vendor/MyChats";
import VendorChat from "./pages/vendor/Chat";
import Billing from "./pages/vendor/Billing";

/* -------- NAVBARS -------- */
import InfluencerNavbar from "./components/common/InfluencerNavbar";
import VendorNavbar from "./components/common/VendorNavbar";

/* -------- ROLE-BASED LAYOUT -------- */
function Layout({ tokens }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  // ❌ No navbar on auth pages
  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  if (role === "influencer") return <InfluencerNavbar tokens={tokens} />;
  if (role === "vendor") return <VendorNavbar />;

  return null;
}

/* -------- ROLE REDIRECT -------- */
function RoleRedirect() {
  const role = localStorage.getItem("role");

  if (role === "influencer") return <Navigate to="/influencer" replace />;
  if (role === "vendor") return <Navigate to="/vendor" replace />;

  return <Navigate to="/login" replace />;
}

function App() {
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem("tokens");
    return saved ? Number(saved) : 200;
  });

  useEffect(() => {
    localStorage.setItem("tokens", tokens);
  }, [tokens]);

  return (
    <Router>
      <Layout tokens={tokens} />

      <Routes>
        {/* 🚀 START HERE */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* -------- AUTH -------- */}
        <Route path="/login" element={<Login setTokens={setTokens} />} />
        <Route path="/register" element={<Register setTokens={setTokens} />} />

        {/* -------- ROLE REDIRECT -------- */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* -------- INFLUENCER -------- */}
        <Route
          path="/influencer"
          element={<InfluencerDashboard />}
        />

        <Route
          path="/influencer/campaign/:id"
          element={
            <CampaignDetails
              tokens={tokens}
              setTokens={setTokens}
            />
          }
        />

        <Route
          path="/influencer/chat/:id"
          element={<Chat tokens={tokens} setTokens={setTokens} />}
        />

        <Route
          path="/influencer/chats"
          element={<MyChats tokens={tokens} />}
        />

        <Route
          path="/influencer/profile"
          element={<InfluencerProfile />}
        />

        <Route
          path="/influencer/no-tokens"
          element={<NotEnoughTokens />}
        />


        {/* -------- VENDOR -------- */}
        <Route path="/vendor/home" element={<Home />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/chats" element={<VendorMyChats />} />
        <Route path="/vendor/chat/:id" element={<VendorChat />} />
        <Route path="/vendor/create" element={<CreateCampaign />} />
        <Route path="/vendor/products" element={<Products />} />
        <Route path="/vendor/billing" element={<Billing />} />
      </Routes>
    </Router>
  );
}

export default App;

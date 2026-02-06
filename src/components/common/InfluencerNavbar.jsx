import { NavLink } from "react-router-dom";

export default function InfluencerNavbar({ tokens }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LEFT */}
        <h1 className="text-lg font-semibold text-blue-600">
          Influencer Panel
        </h1>

        {/* RIGHT */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">

          <NavLink
            to="/influencer"
            end
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "hover:text-blue-600 transition pb-1"
            }
          >
            Campaigns
          </NavLink>

          <NavLink
            to="/influencer/chats"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "hover:text-blue-600 transition pb-1"
            }
          >
            My Chats
          </NavLink>

          <NavLink
            to="/influencer/profile"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "hover:text-blue-600 transition pb-1"
            }
          >
            Profile
          </NavLink>

          {/* Tokens */}
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200">
            {tokens} Tokens
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-red-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

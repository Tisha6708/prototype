import { NavLink } from "react-router-dom";

export default function InfluencerNavbar({ tokens }) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* BRAND */}
        <h1 className="font-bold text-lg text-blue-600">
          Influencer Panel
        </h1>

        {/* NAV LINKS */}
        <div className="flex items-center gap-8 text-sm">
          <NavLink
            to="/influencer"
            end
            className={({ isActive }) =>
              `pb-1 ${isActive
                ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Campaigns
          </NavLink>

          <NavLink
            to="/influencer/chats"
            className={({ isActive }) =>
              `pb-1 ${isActive
                ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
              }`
            }
          >
            My Chats
          </NavLink>

          <NavLink
            to="/influencer/profile"
            className={({ isActive }) =>
              `pb-1 ${isActive
                ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Profile
          </NavLink>

          {/* TOKEN BADGE */}
          <div className="ml-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border">
            {tokens} Tokens
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("role");
              localStorage.removeItem("tokens");

              window.location.href = "/login";

            }}
            className="ml-4 text-red-500 hover:text-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

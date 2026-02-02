import { NavLink } from "react-router-dom";

export default function VendorNavbar() {
  const linkClass = ({ isActive }) =>
    `text-sm ${
      isActive
        ? "font-semibold text-purple-700"
        : "text-gray-600 hover:text-purple-600"
    }`;

  return (
    <div className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b">
      {/* BRAND */}
      <h1 className="font-bold text-purple-600 text-lg">
        Vendor Panel
      </h1>

      {/* NAV LINKS */}
      <div className="flex gap-6 items-center">
        <NavLink to="/vendor/home" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/vendor/create" className={linkClass}>
          Create Post
        </NavLink>

        <NavLink to="/vendor/chats" className={linkClass}>
          Chats
        </NavLink>

        <NavLink to="/vendor/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/vendor/products" className={linkClass}>
          Products
        </NavLink>

        <NavLink to="/vendor/billing" className={linkClass}>
          Billing
        </NavLink>

        {/* LOGOUT */}
        <button
          onClick={() => {
            // 🔒 Clear ONLY session-related data
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("tokens");

            window.location.href = "/login";
          }}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

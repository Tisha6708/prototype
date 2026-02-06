import { NavLink } from "react-router-dom";

export default function VendorNavbar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
      : "text-gray-600 hover:text-blue-600 transition pb-1";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LEFT BRAND */}
        <h1 className="text-lg font-semibold text-blue-600">
          Vendor Panel
        </h1>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">

          <NavLink to="/vendor/home" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/vendor/create" className={linkClass}>
            Create
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
              localStorage.removeItem("userId");
              localStorage.removeItem("role");
              localStorage.removeItem("tokens");
              window.location.href = "/login";
            }}
            className="text-red-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* MOBILE */}
        <div className="md:hidden">
          <button className="text-gray-600 text-xl">☰</button>
        </div>
      </div>
    </nav>
  );
}

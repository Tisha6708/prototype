import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Register({ setTokens }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("influencer");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const userId = res.id;
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", res.role);

      const tokenRes = await api(`/tokens/${userId}`);
      setTokens(tokenRes.tokens);

      navigate(res.role === "vendor" ? "/vendor" : "/influencer");
    } catch (err) {
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleRegister}
          className="bg-white border shadow-xl rounded-2xl p-6 sm:p-8 space-y-5"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Create account
            </h1>
            <p className="text-sm text-gray-500">
              Start your journey
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Account type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="influencer">Influencer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <span
              className="text-blue-600 font-medium cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

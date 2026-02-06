import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function InfluencerProfileModal({
  influencerId,
  onClose,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/profile/${influencerId}`)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [influencerId]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-lg relative max-h-[85vh] flex flex-col">

        {/* HEADER */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            Influencer Profile
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6">

          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading profile…
            </div>
          )}

          {!loading && profile && (
            <>
              {/* NAME */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.name || "Influencer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {profile.niche || "General"} Creator
                </p>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Followers" value={profile.followers_range} />
                <Stat label="Engagement" value={profile.engagement} />
              </div>

              {/* CONTENT TYPES */}
              {profile.content_types?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Content Types
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.content_types.map((c) => (
                      <span
                        key={c}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-100"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BIO */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  About
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.bio || "No bio provided."}
                </p>
              </div>

              {/* STATUS */}
              <div
                className={`p-3 rounded-xl text-sm font-medium ${
                  profile.availability === "Available"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
              >
                Status: {profile.availability || "Unknown"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-3">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-medium text-gray-900 mt-1">
        {value || "—"}
      </p>
    </div>
  );
}

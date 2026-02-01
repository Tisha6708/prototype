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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-lg">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading profile…
          </div>
        )}

        {/* PROFILE */}
        {!loading && profile && (
          <>
            {/* HEADER */}
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {profile.name || "Influencer"}
              </h2>
              <p className="text-sm text-gray-600">
                {profile.niche || "General"} Creator
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Followers</p>
                <p className="font-medium">
                  {profile.followers_range || "—"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Engagement</p>
                <p className="font-medium">
                  {profile.engagement || "—"}
                </p>
              </div>
            </div>

            {/* CONTENT TYPES */}
            {profile.content_types?.length > 0 && (
              <div className="mb-5">
                <p className="font-medium mb-2">
                  Content Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.content_types.map((c) => (
                    <span
                      key={c}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ABOUT */}
            <div className="mb-5">
              <p className="font-medium mb-1">About</p>
              <p className="text-sm text-gray-600">
                {profile.bio || "No bio provided."}
              </p>
            </div>

            {/* AVAILABILITY */}
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                profile.availability === "Available"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              Status: {profile.availability || "Unknown"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

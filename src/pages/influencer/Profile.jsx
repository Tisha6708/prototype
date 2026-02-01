import { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function InfluencerProfile() {
  const userId = Number(localStorage.getItem("userId"));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    niche: "",
    followers_range: "",
    engagement: "",
    content_types: [],
    bio: "",
    availability: "Open",
  });

  // 🔹 Load profile
  useEffect(() => {
    api(`/profile/${userId}`)
      .then((data) => {
        if (data) {
          setProfile(data);
          setIsSaved(true);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleContentType = (type) => {
    setProfile((prev) => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter((t) => t !== type)
        : [...prev.content_types, type],
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    await api("/profile", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        ...profile,
      }),
    });

    setSaving(false);
    setIsSaved(true);
  };

  if (loading) {
    return <PageWrapper title="Loading profile..." />;
  }

  return (
    <PageWrapper
      title="My Profile"
      subtitle="This is how vendors see you"
    >
      {/* ================= VIEW MODE ================= */}
      {isSaved ? (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">
              {profile.niche} Creator
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Followers</p>
              <p className="font-medium">
                {profile.followers_range}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Engagement</p>
              <p className="font-medium">
                {profile.engagement}
              </p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Content Types</p>
            <div className="flex flex-wrap gap-2">
              {profile.content_types.map((type) => (
                <span
                  key={type}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-1">About</p>
            <p className="text-gray-600 text-sm">
              {profile.bio || "—"}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded border text-green-800 text-sm">
            Status: {profile.availability}
          </div>

          {/* OPTIONAL EDIT */}
          <button
            onClick={() => setIsSaved(false)}
            className="text-sm text-blue-600"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        /* ================= EDIT MODE ================= */
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6">

          <div>
            <label className="block font-medium mb-1">
              Display Name
            </label>
            <input
              value={profile.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="border p-3 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Primary Niche
            </label>
            <select
              value={profile.niche}
              onChange={(e) =>
                handleChange("niche", e.target.value)
              }
              className="border p-3 w-full rounded"
            >
              <option value="">Select niche</option>
              <option>Lifestyle</option>
              <option>Fashion</option>
              <option>Fitness</option>
              <option>Tech</option>
              <option>Beauty</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Followers Range
            </label>
            <select
              value={profile.followers_range}
              onChange={(e) =>
                handleChange("followers_range", e.target.value)
              }
              className="border p-3 w-full rounded"
            >
              <option value="">Select range</option>
              <option>1k–10k</option>
              <option>10k–50k</option>
              <option>50k–100k</option>
              <option>100k+</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Engagement Level
            </label>
            <select
              value={profile.engagement}
              onChange={(e) =>
                handleChange("engagement", e.target.value)
              }
              className="border p-3 w-full rounded"
            >
              <option value="">Select</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Content Types
            </label>
            <div className="flex flex-wrap gap-3">
              {["Reels", "Shorts", "Posts", "Stories"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleContentType(type)}
                    className={`px-4 py-2 rounded border ${
                      profile.content_types.includes(type)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Short Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) =>
                handleChange("bio", e.target.value)
              }
              className="border p-3 w-full rounded"
              rows={3}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}
    </PageWrapper>
  );
}

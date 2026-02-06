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
      body: JSON.stringify({ user_id: userId, ...profile }),
    });
    setSaving(false);
    setIsSaved(true);
  };

  if (loading) {
    return (
      <PageWrapper title="My Profile">
        <div className="flex justify-center py-24 text-gray-500">
          Loading profile...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Profile"
      subtitle="This is how vendors see you"
    >
      <div className="max-w-3xl space-y-8">

        {isSaved ? (
          <>
            {/* HEADER CARD */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-gray-500 mt-1">
                {profile.niche} Creator
              </p>
            </div>

            {/* STATS */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Stat label="Followers" value={profile.followers_range} />
              <Stat label="Engagement" value={profile.engagement} />
            </div>

            {/* CONTENT TYPES */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <p className="font-medium text-gray-900 mb-3">
                Content Types
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.content_types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* BIO */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <p className="font-medium text-gray-900 mb-2">
                About
              </p>
              <p className="text-gray-600 text-sm">
                {profile.bio || "—"}
              </p>
            </div>

            {/* STATUS */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
              Status: {profile.availability}
            </div>

            <button
              onClick={() => setIsSaved(false)}
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            {/* FORM */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">

              <Input
                label="Display Name"
                value={profile.name}
                onChange={(v) => handleChange("name", v)}
              />

              <Select
                label="Primary Niche"
                value={profile.niche}
                onChange={(v) => handleChange("niche", v)}
                options={["Lifestyle","Fashion","Fitness","Tech","Beauty"]}
              />

              <Select
                label="Followers Range"
                value={profile.followers_range}
                onChange={(v) => handleChange("followers_range", v)}
                options={["1k–10k","10k–50k","50k–100k","100k+"]}
              />

              <Select
                label="Engagement Level"
                value={profile.engagement}
                onChange={(v) => handleChange("engagement", v)}
                options={["High","Medium","Low"]}
              />

              {/* CONTENT TYPES */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Content Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Reels","Shorts","Posts","Stories"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleContentType(type)}
                      className={`px-3 py-2 rounded-lg border text-sm transition
                        ${
                          profile.content_types.includes(type)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 hover:border-blue-400"
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* BIO */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

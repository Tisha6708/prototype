import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/campaigns")
      .then((data) => setCampaigns(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      title="Available Campaigns"
      subtitle="Collaborate with brands and grow your influence"
    >
      {loading ? (
        <div className="flex justify-center py-28 text-gray-500">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border rounded-2xl shadow-sm p-14 text-center max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">
            No campaigns available
          </h3>
          <p className="text-gray-500">
            New brand opportunities will appear here soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col"
            >
              {/* HEADER */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {campaign.product_name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Campaign #{campaign.id}
                </p>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                {campaign.description}
              </p>

              {/* TAG */}
              <span className="mt-4 w-fit text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                New
              </span>

              {/* BUTTON */}
              <button
                onClick={() =>
                  navigate(`/influencer/campaign/${campaign.id}`)
                }
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
              >
                View Campaign
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

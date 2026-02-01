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
      .then((data) => {
        setCampaigns(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      title="Available Campaigns"
      subtitle="Explore brand collaborations and start chatting"
    >
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow text-center max-w-lg mx-auto">
          <h3 className="text-lg font-semibold mb-2">
            No campaigns available
          </h3>
          <p className="text-gray-500">
            New brand opportunities will appear here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col"
            >
              {/* HEADER */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg">
                  {campaign.product_name}
                </h3>
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  New Campaign
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 flex-1">
                {campaign.description}
              </p>

              {/* FOOTER */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Campaign #{campaign.id}
                </span>

                <button
                  onClick={() =>
                    navigate(
                      `/influencer/campaign/${campaign.id}`
                    )
                  }
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

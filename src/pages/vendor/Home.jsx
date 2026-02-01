import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function VendorHome() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const vendorId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    api("/campaigns")
      .then((data) => {
        const myCampaigns = data.filter(
          (c) => c.vendor_id === vendorId
        );
        setCampaigns(myCampaigns);
      })
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <PageWrapper
      title="My Campaigns"
      subtitle="Create, monitor, and manage influencer collaborations"
    >
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold">
            Active Marketing Posts
          </h2>
          <p className="text-sm text-gray-500">
            These campaigns are visible to influencers
          </p>
        </div>

        <button
          onClick={() => navigate("/vendor/create")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow"
        >
          + Create Campaign
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow text-center max-w-lg mx-auto">
          <h3 className="text-lg font-semibold mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start your first influencer marketing campaign to
            reach creators.
          </p>
          <button
            onClick={() => navigate("/vendor/create")}
            className="bg-purple-600 text-white px-6 py-3 rounded"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col"
            >
              {/* CARD HEADER */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg">
                  {campaign.product_name}
                </h3>
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Active
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 flex-1">
                {campaign.description}
              </p>

              {/* FOOTER */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Campaign #{campaign.id}
                </span>

                <button
                  onClick={() =>
                    navigate(`/vendor/chat/${campaign.id}`)
                  }
                  className="text-purple-600 hover:underline"
                >
                  View Chats →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

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
      subtitle="Create and manage influencer collaborations"
    >
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Active Campaigns
          </h2>
          <p className="text-sm text-gray-500">
            Campaigns currently visible to influencers
          </p>
        </div>

        <button
          onClick={() => navigate("/vendor/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition"
        >
          + Create Campaign
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-28 text-gray-500">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white border rounded-2xl shadow-sm p-14 text-center max-w-xl mx-auto">
          <div className="text-5xl mb-4">📣</div>
          <h3 className="text-xl font-semibold mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-500 mb-6">
            Launch your first campaign and start collaborating with influencers.
          </p>

          <button
            onClick={() => navigate("/vendor/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        /* GRID */
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col"
            >
              {/* CARD TOP */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition">
                  {campaign.product_name}
                </h3>

                <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                  Active
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                {campaign.description}
              </p>

              {/* FOOTER */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Campaign #{campaign.id}
                </span>

                <button
                  onClick={() =>
                    navigate(`/vendor/chat/${campaign.id}`)
                  }
                  className="text-blue-600 font-medium text-sm hover:underline"
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

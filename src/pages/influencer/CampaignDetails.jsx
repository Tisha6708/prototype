import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function CampaignDetails({ tokens, setTokens }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    api("/campaigns")
      .then((data) => {
        const found = data.find((c) => c.id === Number(id));
        setCampaign(found);
      })
      .finally(() => setLoading(false));
  }, [id, userId, navigate]);

  if (loading) return <PageWrapper>Loading...</PageWrapper>;
  if (!campaign) return <PageWrapper>Campaign not found</PageWrapper>;

  const vendorId = campaign.vendor_id;
  const paidKey = `paid_${userId}_${campaign.id}`;
  const alreadyPaid = localStorage.getItem(paidKey);

  const handleContact = async () => {
    if (processing) return;
    setProcessing(true);

    const chat = await api("/chats", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaign.id,
        vendor_id: vendorId,
        influencer_id: userId,
      }),
    });

    if (!alreadyPaid) {
      const tokenRes = await api(
        `/tokens/deduct?user_id=${userId}&amount=50`,
        { method: "POST" }
      );

      if (tokenRes.error) {
        navigate("/influencer/no-tokens");
        return;
      }

      localStorage.setItem(paidKey, "true");
      setTokens(tokenRes.tokens);
    }

    navigate(`/influencer/chat/${chat.id}`);
  };

  return (
    <PageWrapper
      title="Campaign Details"
      subtitle="Review campaign info and contact the vendor"
    >
      <div className="max-w-3xl">

        {/* MAIN CARD */}
        <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-8">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {campaign.product_name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Campaign ID #{campaign.id}
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              About the Campaign
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* ALREADY CONTACTED */}
          {alreadyPaid && (
            <div className="flex gap-3 bg-green-50 border border-green-200 p-4 rounded-xl">
              <span className="text-green-600 font-semibold">✔</span>
              <p className="text-green-700 text-sm">
                You’ve already contacted this vendor. You can continue
                the conversation anytime.
              </p>
            </div>
          )}

          {/* ACTION AREA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t">

            <button
              onClick={handleContact}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-60"
            >
              {processing
                ? "Opening chat..."
                : alreadyPaid
                ? "Open Chat"
                : "Contact Vendor (50 tokens)"}
            </button>

            {!alreadyPaid && (
              <span className="text-sm text-gray-500">
                Your balance:{" "}
                <span className="font-semibold text-gray-900">
                  {tokens} tokens
                </span>
              </span>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

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
        const found = data.find(
          (c) => c.id === Number(id)
        );
        setCampaign(found);
      })
      .finally(() => setLoading(false));
  }, [id, userId, navigate]);

  if (loading) return <PageWrapper title="Loading..." />;
  if (!campaign)
    return <PageWrapper title="Campaign not found" />;

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

    // 🔒 Pay only once per campaign
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
    <PageWrapper title="Campaign Details">
      <div className="bg-white p-8 rounded-xl shadow max-w-3xl space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold">
            {campaign.product_name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Campaign ID #{campaign.id}
          </p>
        </div>

        {/* DESCRIPTION */}
        <div>
          <h3 className="font-semibold mb-1">
            About the Campaign
          </h3>
          <p className="text-gray-600">
            {campaign.description}
          </p>
        </div>

        {/* STATUS */}
        {alreadyPaid && (
          <div className="bg-green-50 border border-green-200 p-4 rounded text-green-800 text-sm">
            ✔ You’ve already contacted this vendor.  
            You can continue the conversation anytime.
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleContact}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:opacity-60"
          >
            {processing
              ? "Opening chat..."
              : alreadyPaid
              ? "Open Chat"
              : "Contact Vendor (50 tokens)"}
          </button>

          {!alreadyPaid && (
            <span className="text-sm text-gray-500">
              Your balance: {tokens} tokens
            </span>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

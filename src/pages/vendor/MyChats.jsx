import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function VendorMyChats() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const vendorId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    api(`/chats/user/${vendorId}`)
      .then(setChats)
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <PageWrapper
      title="My Chats"
      subtitle="Conversations with influencers about your campaigns"
    >
      {loading ? (
        <div className="flex justify-center py-28 text-gray-500">
          Loading chats...
        </div>
      ) : chats.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white border rounded-2xl shadow-sm p-14 text-center max-w-xl mx-auto">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">
            No conversations yet
          </h2>
          <p className="text-gray-500">
            When influencers reach out about your campaigns,
            their chats will appear here.
          </p>
        </div>
      ) : (
        /* CHAT LIST */
        <div className="space-y-4 max-w-3xl">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() =>
                navigate(`/vendor/chat/${chat.id}`)
              }
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-gray-900">
                  Campaign #{chat.campaign_id}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Open conversation with influencer
                </p>
              </div>

              {/* RIGHT */}
              <div className="text-blue-600 text-sm font-medium">
                Open →
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function MyChats() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    api(`/chats/user/${userId}`)
      .then(setChats)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <PageWrapper
      title="My Chats"
      subtitle="Your conversations with brands"
    >
      {loading ? (
        <div className="flex justify-center py-28 text-gray-500">
          Loading chats...
        </div>
      ) : chats.length === 0 ? (
        <div className="bg-white border rounded-2xl shadow-sm p-14 text-center max-w-xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">
            No chats yet
          </h2>
          <p className="text-gray-500">
            Contact a vendor from a campaign to start chatting.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() =>
                navigate(`/influencer/chat/${chat.id}`)
              }
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  Campaign #{chat.campaign_id}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Open conversation with vendor
                </p>
              </div>

              <span className="text-blue-600 font-medium text-sm">
                Open →
              </span>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";
import InfluencerProfileModal from "../../components/vendor/InfluencerProfileModal";

export default function VendorChat() {
  const { id } = useParams(); // chatId

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const vendorId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    api(`/messages/${id}`).then(setMessages);

    api(`/chats/user/${vendorId}`).then((chats) => {
      const found = chats.find((c) => c.id === Number(id));
      setChat(found);
    });
  }, [id, vendorId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const msg = await api("/messages", {
      method: "POST",
      body: JSON.stringify({
        chat_id: Number(id),
        sender_id: vendorId,
        text: input,
      }),
    });

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <PageWrapper title="Chat">
      <div className="bg-white rounded-xl shadow h-[70vh] flex flex-col">

        {/* 🔹 HEADER */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">
              Influencer Conversation
            </p>
            <p className="text-xs text-gray-500">
              Discuss campaign details privately
            </p>
          </div>

          {chat && (
            <button
              onClick={() => setShowProfile(true)}
              className="text-sm bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border hover:bg-blue-100"
            >
              View Influencer Profile
            </button>
          )}
        </div>

        {/* 🔹 MESSAGES */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto bg-gray-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-xs px-4 py-2 text-sm rounded-xl ${
                m.sender_id === vendorId
                  ? "bg-purple-600 text-white ml-auto"
                  : "bg-white text-gray-800 border"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* 🔹 INPUT */}
        <div className="border-t px-6 py-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-3 flex-1 rounded-lg text-sm"
            placeholder="Type your message…"
          />
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>

      {/* 🔹 PROFILE MODAL */}
      {showProfile && chat && (
        <InfluencerProfileModal
          influencerId={chat.influencer_id}
          onClose={() => setShowProfile(false)}
        />
      )}
    </PageWrapper>
  );
}

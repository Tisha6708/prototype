import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function Chat({ tokens, setTokens }) {
  const { id } = useParams(); // chatId
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const userId = Number(localStorage.getItem("userId"));

  const FREE_LIMIT = 5;
  const PAID_BLOCK_SIZE = 3;
  const BLOCK_COST = 5;

  const msgKey = `chat_msgs_${userId}_${id}`;
  const paidKey = `chat_paid_blocks_${userId}_${id}`;

  useEffect(() => {
    api(`/messages/${id}`).then((data) => {
      setMessages(data);

      // sync influencer message count
      const influencerCount = data.filter(
        (m) => m.sender_id === userId
      ).length;

      localStorage.setItem(msgKey, influencerCount);
    });
  }, [id, userId]);

  const sentCount =
    Number(localStorage.getItem(msgKey)) || 0;

  const paidBlocks =
    Number(localStorage.getItem(paidKey)) || 0;

  const chargeableMsgs = Math.max(
    0,
    sentCount - FREE_LIMIT
  );

  const requiredBlocks = Math.floor(
    chargeableMsgs / PAID_BLOCK_SIZE
  );

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);

    // 🔒 Deduct tokens ONLY when entering a new block
    if (requiredBlocks > paidBlocks) {
      const tokenRes = await api(
        `/tokens/deduct?user_id=${userId}&amount=${BLOCK_COST}`,
        { method: "POST" }
      );

      if (tokenRes.error) {
        navigate("/influencer/no-tokens");
        return;
      }

      localStorage.setItem(
        paidKey,
        paidBlocks + 1
      );
      setTokens(tokenRes.tokens);
    }

    const msg = await api("/messages", {
      method: "POST",
      body: JSON.stringify({
        chat_id: Number(id),
        sender_id: userId,
        text: input,
      }),
    });

    const newCount = sentCount + 1;
    localStorage.setItem(msgKey, newCount);

    setMessages((prev) => [...prev, msg]);
    setInput("");
    setSending(false);
  };

  return (
    <PageWrapper title="Chat">
      <div className="bg-white rounded-xl shadow h-[70vh] flex flex-col">

        {/* HEADER */}
        <div className="border-b p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Conversation</p>
            <p className="text-xs text-gray-500">
              {sentCount < FREE_LIMIT
                ? `${FREE_LIMIT - sentCount} free messages left`
                : `5 tokens per ${PAID_BLOCK_SIZE} messages`}
            </p>
          </div>

          <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border">
            {tokens} Tokens
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                m.sender_id === userId
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="border-t p-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-3 flex-1 rounded"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

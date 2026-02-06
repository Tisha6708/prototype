import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function Chat({ tokens, setTokens }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const userId = Number(localStorage.getItem("userId"));

  const FREE_LIMIT = 5;
  const PAID_BLOCK_SIZE = 3;
  const BLOCK_COST = 5;

  const msgKey = `chat_msgs_${userId}_${id}`;
  const paidKey = `chat_paid_blocks_${userId}_${id}`;
  const autoMsgKey = `auto_interest_sent_${userId}_${id}`;

  useEffect(() => {
    const loadMessages = async () => {
      const data = await api(`/messages/${id}`);

      if (data.length === 0 && !localStorage.getItem(autoMsgKey)) {
        await api("/messages", {
          method: "POST",
          body: JSON.stringify({
            chat_id: Number(id),
            sender_id: userId,
            text: "Hi, I’m interested in this campaign.",
          }),
        });

        localStorage.setItem(autoMsgKey, "true");

        const updated = await api(`/messages/${id}`);
        setMessages(updated);
        localStorage.setItem(msgKey, 1);
        return;
      }

      setMessages(data);

      const influencerCount = data.filter(
        (m) => m.sender_id === userId
      ).length;

      localStorage.setItem(msgKey, influencerCount);
    };

    loadMessages();
  }, [id, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sentCount = Number(localStorage.getItem(msgKey)) || 0;
  const paidBlocks = Number(localStorage.getItem(paidKey)) || 0;

  const chargeableMsgs = Math.max(0, sentCount - FREE_LIMIT);
  const requiredBlocks = Math.floor(chargeableMsgs / PAID_BLOCK_SIZE);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    if (requiredBlocks > paidBlocks) {
      const tokenRes = await api(
        `/tokens/deduct?user_id=${userId}&amount=${BLOCK_COST}`,
        { method: "POST" }
      );

      if (tokenRes.error) {
        navigate("/influencer/no-tokens");
        return;
      }

      localStorage.setItem(paidKey, paidBlocks + 1);
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
    <PageWrapper title="Conversation">
      <div className="bg-white border rounded-2xl shadow-sm h-[75vh] flex flex-col max-w-3xl">

        {/* HEADER */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900">
              Chat
            </h2>
            <p className="text-xs text-gray-500">
              {sentCount < FREE_LIMIT
                ? `${FREE_LIMIT - sentCount} free messages left`
                : `5 tokens per ${PAID_BLOCK_SIZE} messages`}
            </p>
          </div>

          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-200">
            {tokens} tokens
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-3 bg-blue-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-xs px-4 py-2 text-sm rounded-xl ${
                m.sender_id === userId
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-white border text-gray-800"
              }`}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t px-6 py-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";

export default function NotEnoughTokens() {
  const navigate = useNavigate();

  return (
    <PageWrapper title="Not Enough Tokens">
      <div className="max-w-md mx-auto mt-16 bg-white border rounded-2xl shadow-sm p-8 text-center">

        <div className="text-5xl mb-4">⚠️</div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          You’re out of tokens
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          You need more tokens to continue chatting with this vendor.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/influencer")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
          >
            Browse Campaigns
          </button>

          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Go Back
          </button>
        </div>

      </div>
    </PageWrapper>
  );
}

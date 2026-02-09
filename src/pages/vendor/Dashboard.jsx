import { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#14b8a6",
  "#f43f5e",
];

export default function VendorDashboard() {
  const vendorId = Number(localStorage.getItem("userId"));

  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [showExpertModal, setShowExpertModal] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    api(`/analytics/${vendorId}`).then(setData);
  }, [vendorId]);

  const fetchAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiData(null);

    try {
      const res = await api(`/analytics/${vendorId}/marketing`);
      setAiData(res.marketing_insights);
    } catch (err) {
      setAiError("Failed to generate AI insights");
    } finally {
      setAiLoading(false);
    }
  };

  if (!data) {
    return (
      <PageWrapper title="Analytics Overview">
        <div className="flex justify-center py-28 text-gray-500">
          Loading analytics...
        </div>
      </PageWrapper>
    );
  }

  const sales = data.sales || [];
  const kpis = data.kpis || {};

  return (
    <PageWrapper
      title="Analytics Dashboard"
      subtitle="Track sales performance and inventory health"
    >
      {/* KPI */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPI label="Total Profit" value={`₹${kpis.total_profit || 0}`} />
        <KPI label="Units Sold" value={kpis.total_units_sold || 0} />
        <KPI label="Products Sold" value={kpis.product_count || 0} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Sales Distribution">
          {sales.length === 0 ? (
            <Empty text="No sales data" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={sales} dataKey="quantity" nameKey="name" outerRadius={120} label>
                  {sales.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Profit by Product">
          {sales.length === 0 ? (
            <Empty text="No profit data" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sales}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit">
                  {sales.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-10">
        <h3 className="font-semibold text-blue-900 mb-4">
          Marketing Insights
        </h3>

        <div className="flex gap-4 flex-wrap">
          {!aiData && !aiLoading && (
            <button
              onClick={fetchAiInsights}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Get AI Assistance
            </button>
          )}

          <button
            onClick={() => setShowExpertModal(true)}
            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold"
          >
            Get Expert Marketing Advice
          </button>
        </div>

        {aiLoading && (
          <p className="text-sm text-blue-700 mt-3">
            Analyzing your data...
          </p>
        )}

        {aiError && (
          <p className="text-sm text-red-600 mt-3">{aiError}</p>
        )}

        {aiData && (
          <div className="space-y-5 mt-4 text-sm">
            <Section title="Key Insights" items={aiData.key_insights} />
            <Section title="Problems Detected" items={aiData.problems} />

            <div>
              <h4 className="font-semibold mb-2">Recommended Actions</h4>
              <div className="space-y-3">
                {aiData.recommended_actions.map((a, i) => (
                  <div key={i} className="bg-white border rounded-xl p-4">
                    <p className="font-semibold">
                      {a.priority} – {a.action}
                    </p>
                    <p className="text-gray-600">{a.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Track: {a.metric_to_track}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {aiData.budget_advice && (
              <div>
                <h4 className="font-semibold mb-1">Budget Advice</h4>
                <p>{aiData.budget_advice}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXPERT MODAL */}
      {showExpertModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowExpertModal(false)}
              className="absolute top-3 right-4 text-gray-400 text-xl"
            >
              ×
            </button>

            <div className="text-center space-y-4">
              <div className="text-5xl">📞</div>
              <h3 className="text-xl font-semibold">
                Expert Marketing Assistance
              </h3>
              <p className="text-gray-600 text-sm">
                We’ll connect you with a verified marketing expert who will
                contact you shortly to help grow your business.
              </p>

              <button
                onClick={() => setShowExpertModal(false)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

/* ---------------- helpers ---------------- */

function KPI({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-gray-500">{text}</p>;
}

function Section({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="list-disc ml-5 space-y-1">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

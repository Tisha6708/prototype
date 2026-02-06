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

const COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#1d4ed8"];

export default function VendorDashboard() {
  const vendorId = Number(localStorage.getItem("userId"));
  const [data, setData] = useState(null);

  // 🔹 AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    api(`/analytics/${vendorId}`).then(setData);
  }, [vendorId]);

  // 🔹 AI button handler
  const fetchAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await api(
        `/analytics/${vendorId}/marketing`
      );
      setAiInsights(res.marketing_insights);
    } catch (e) {
      setAiError("AI service unavailable. Try again later.");
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
  const lowStock = data.low_stock || [];
  const kpis = data.kpis || {};

  return (
    <PageWrapper
      title="Analytics Dashboard"
      subtitle="Track campaign performance and product sales"
    >
      {/* KPI ROW */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPI label="Total Profit" value={`₹${kpis.total_profit || 0}`} />
        <KPI label="Units Sold" value={kpis.total_units_sold || 0} />
        <KPI label="Products Sold" value={kpis.product_count || 0} />
      </div>

      {/* AI SALES ASSISTANCE BUTTON */}
      <div className="mb-6">
        <button
          onClick={fetchAiInsights}
          disabled={aiLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {aiLoading ? "Analyzing sales..." : "AI Sales Assistance"}
        </button>
      </div>

      {/* AI INSIGHTS */}
      {aiError && (
        <div className="bg-red-50 p-4 rounded-xl mb-6 text-sm text-red-600">
          {aiError}
        </div>
      )}

      {aiInsights && (
        <div className="bg-blue-50 p-6 rounded-xl mb-6">
          <h3 className="font-semibold mb-3">
            AI Sales Insights
          </h3>

          <ul className="list-disc pl-5 text-sm mb-4">
            {aiInsights.key_insights?.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>

          <h4 className="font-medium mb-2">Problems</h4>
          <ul className="list-disc pl-5 text-sm mb-4">
            {aiInsights.problems?.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>

          <h4 className="font-medium mb-2">
            Recommended Actions
          </h4>
          <ul className="space-y-2 text-sm">
            {aiInsights.recommended_actions?.map(
              (a, i) => (
                <li
                  key={i}
                  className="border rounded p-3 bg-white"
                >
                  <p className="font-semibold">
                    {a.priority}: {a.action}
                  </p>
                  <p className="text-gray-600">
                    {a.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    Track: {a.metric_to_track}
                  </p>
                </li>
              )
            )}
          </ul>

          <p className="mt-4 text-sm">
            <strong>Budget Advice:</strong>{" "}
            {aiInsights.budget_advice}
          </p>
        </div>
      )}

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PIE */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">
            Sales Distribution
          </h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">
              No sales data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>
                <Pie
                  data={sales}
                  dataKey="quantity"
                  nameKey="name"
                  outerRadius={120}
                >
                  {sales.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        COLORS[i % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* BAR */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">
            Profit by Product
          </h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">
              No profit data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={sales}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#2563eb" />
                <Bar
                  dataKey="profit"
                  fill="#7c3aed"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LOW STOCK */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-8">
          <h4 className="font-semibold text-red-700 mb-3">
            Low Stock Alert
          </h4>
          <ul className="text-sm text-red-600 space-y-1">
            {lowStock.map((p) => (
              <li key={p.product_name}>
                {p.product_name} —{" "}
                {p.quantity_available} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI INSIGHT */}
      {data.insight && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            AI Insights
          </h3>
          <p className="text-sm whitespace-pre-line text-gray-700">
            {data.insight}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}

function KPI({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">
        {value}
      </p>
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">
        {label}
      </p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

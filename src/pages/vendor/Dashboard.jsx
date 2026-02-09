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

/* Multicolor palette for charts */
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

  useEffect(() => {
    if (!vendorId) return;
    api(`/analytics/${vendorId}`).then(setData);
  }, [vendorId]);

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
      subtitle="Track sales performance and inventory health"
    >
      {/* KPI */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPI label="Total Profit" value={`₹${kpis.total_profit || 0}`} />
        <KPI label="Units Sold" value={kpis.total_units || 0} />
        <KPI label="Products Sold" value={kpis.product_count || 0} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PIE */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            Sales Distribution
          </h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">No sales data</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sales}
                  dataKey="quantity"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {sales.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
            Profit by Product
          </h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">No profit data</p>
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
                {p.product_name} — {p.quantity_available} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI INSIGHTS */}
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

      {/* CTA */}
      <div className="flex justify-center mt-10 gap-10.5">
        <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-7 py-3 rounded-xl font-semibold shadow-sm">
          Get Marketing Assistance
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-7 py-3 rounded-xl font-semibold shadow-sm">
          Get AI Assistance
        </button>
      </div>
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
    </div>
  );
}
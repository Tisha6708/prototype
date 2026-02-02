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

const COLORS = ["#7c3aed", "#22c55e", "#f97316", "#0ea5e9"];

export default function VendorDashboard() {
  const vendorId = Number(localStorage.getItem("userId"));
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/analytics/${vendorId}`).then(setData);
  }, [vendorId]);

  if (!data) {
    return (
      <PageWrapper title="Sales Analytics">
        <p className="text-gray-500">Loading analytics...</p>
      </PageWrapper>
    );
  }

  // ✅ SAFE NORMALIZATION
  const sales = data.sales || [];
  const lowStock = data.low_stock || [];
  const kpis = data.kpis || {};

  return (
    <PageWrapper title="Sales Analytics">
      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <KPI label="Total Profit" value={`₹${kpis.total_profit || 0}`} />
        <KPI label="Units Sold" value={kpis.total_units || 0} />
        <KPI label="Products Sold" value={kpis.product_count || 0} />
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Sales Distribution</h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">No sales data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sales}
                  dataKey="quantity"
                  nameKey="name"
                  outerRadius={120}
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

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Profit by Product</h3>

          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">No profit data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sales}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LOW STOCK */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 p-4 rounded-xl mt-6">
          <h4 className="font-semibold text-red-700 mb-2">
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

      {/* AI INSIGHT */}
      {data.insight && (
        <div className="bg-blue-50 p-6 rounded-xl mt-6">
          <h3 className="font-semibold mb-2">AI Insights</h3>
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
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function Billing() {
  const vendorId = Number(localStorage.getItem("userId"));
  const [products, setProducts] = useState([]);
  const [bill, setBill] = useState({
    productId: "",
    qty: "",
    price: "",
  });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api(`/products?vendor_id=${vendorId}`).then(setProducts);
  }, [vendorId]);

  const selected = products.find(
    (p) => p.id === Number(bill.productId)
  );

  const handleGenerate = async () => {
    const res = await api("/bills", {
      method: "POST",
      body: JSON.stringify({
        vendor_id: vendorId,
        product_id: Number(bill.productId),
        quantity: Number(bill.qty),
        selling_price: Number(bill.price),
      }),
    });

    setSummary(res);
  };

  return (
    <PageWrapper title="Generate Bill">
      <div className="bg-white p-6 rounded-xl shadow max-w-xl space-y-4">
        <select
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setBill({ ...bill, productId: e.target.value })
          }
        >
          <option>Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_name} (Stock: {p.quantity_available})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity sold"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setBill({ ...bill, qty: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Selling price per unit"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setBill({ ...bill, price: e.target.value })
          }
        />

        {selected && bill.qty && bill.price && (
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p>Total: ₹{bill.qty * bill.price}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="bg-purple-600 text-white py-2 rounded w-full"
        >
          Generate Bill
        </button>

        {summary && (
          <div className="bg-green-50 p-4 rounded text-sm">
            <p className="font-medium">Bill Generated</p>
            <p>Product: {summary.product_name}</p>
            <p>Quantity: {summary.quantity}</p>
            <p>Price per unit: ₹{summary.price_per_unit}</p>
            <p className="font-semibold">
              Total: ₹{summary.total}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

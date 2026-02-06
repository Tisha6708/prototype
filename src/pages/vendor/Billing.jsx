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
    <PageWrapper
      title="Generate Bill"
      subtitle="Create invoices for sold products"
    >
      <div className="bg-white border rounded-2xl shadow-sm p-8 max-w-xl space-y-6">

        {/* PRODUCT */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
        </div>

        {/* QTY */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Quantity Sold
          </label>
          <input
            type="number"
            placeholder="Enter quantity"
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onChange={(e) =>
              setBill({ ...bill, qty: e.target.value })
            }
          />
        </div>

        {/* PRICE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selling Price (per unit)
          </label>
          <input
            type="number"
            placeholder="Enter price"
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onChange={(e) =>
              setBill({ ...bill, price: e.target.value })
            }
          />
        </div>

        {/* TOTAL PREVIEW */}
        {selected && bill.qty && bill.price && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm">
            <p className="text-gray-600">Estimated Total</p>
            <p className="text-xl font-semibold text-blue-700">
              ₹{bill.qty * bill.price}
            </p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium shadow-sm transition"
        >
          Generate Bill
        </button>

        {/* SUMMARY */}
        {summary && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
            <h3 className="font-semibold text-green-700 mb-2">
              Bill Generated
            </h3>

            <div className="text-sm text-gray-700 space-y-1">
              <p>Product: {summary.product_name}</p>
              <p>Quantity: {summary.quantity}</p>
              <p>Price per unit: ₹{summary.price_per_unit}</p>
              <p className="font-semibold text-lg">
                Total: ₹{summary.total}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

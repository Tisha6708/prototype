import { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function Products() {
  const vendorId = Number(localStorage.getItem("userId"));
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cost: "",
    qty: "",
  });

  useEffect(() => {
    api(`/products?vendor_id=${vendorId}`).then(setProducts);
  }, [vendorId]);

  const handleAdd = async () => {
    const newProduct = await api("/products", {
      method: "POST",
      body: JSON.stringify({
        vendor_id: vendorId,
        product_name: form.name,
        cost_price: Number(form.cost),
        quantity_available: Number(form.qty),
      }),
    });

    setProducts([...products, newProduct]);
    setForm({ name: "", cost: "", qty: "" });
  };

  return (
    <PageWrapper
      title="Inventory"
      subtitle="Manage your product stock and pricing"
    >
      {/* ADD PRODUCT FORM */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Product
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <input
            placeholder="Cost price"
            type="number"
            value={form.cost}
            onChange={(e) =>
              setForm({ ...form, cost: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <input
            placeholder="Quantity"
            type="number"
            value={form.qty}
            onChange={(e) =>
              setForm({ ...form, qty: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3 outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={handleAdd}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      {products.length === 0 ? (
        <div className="bg-white border rounded-2xl shadow-sm p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">
            No products yet
          </h3>
          <p className="text-gray-500">
            Add your first product to start tracking inventory.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">
                {p.product_name}
              </h3>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>Stock: {p.quantity_available}</p>
                <p>Cost: ₹{p.cost_price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

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
    <PageWrapper title="Inventory">
      <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-3 gap-4">
        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Cost price"
          type="number"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Quantity"
          type="number"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAdd}
          className="col-span-3 bg-purple-600 text-white py-2 rounded"
        >
          Add Product
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold">{p.product_name}</h3>
            <p className="text-sm text-gray-600">
              Stock: {p.quantity_available}
            </p>
            <p className="text-sm text-gray-600">
              Cost: ₹{p.cost_price}
            </p>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

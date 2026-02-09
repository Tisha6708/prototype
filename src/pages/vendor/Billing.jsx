import { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function Billing() {
  const vendorId = Number(localStorage.getItem("userId"));

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState(null);

  const [current, setCurrent] = useState({
    productId: "",
    qty: "",
    price: "",
  });

  useEffect(() => {
    api(`/products?vendor_id=${vendorId}`).then(setProducts);
  }, [vendorId]);

  const selectedProduct = products.find(
    (p) => p.id === Number(current.productId)
  );

  const addToCart = () => {
    if (!selectedProduct || !current.qty || !current.price) return;

    setCart((prev) => [
      ...prev,
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        quantity: Number(current.qty),
        selling_price: Number(current.price),
        total: Number(current.qty) * Number(current.price),
      },
    ]);

    setCurrent({ productId: "", qty: "", price: "" });
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (cart.length === 0) return;

    const res = await api("/bills", {
      method: "POST",
      body: JSON.stringify({
        vendor_id: vendorId,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          selling_price: item.selling_price,
        })),
      }),
    });

    setSummary(res);
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.total, 0);

  return (
    <PageWrapper
      title="Generate Bill"
      subtitle="Classic multi-product billing"
    >
      <div className="bg-white border rounded-2xl shadow-sm p-8 max-w-xl space-y-6">

        {/* PRODUCT SELECT */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            value={current.productId}
            onChange={(e) =>
              setCurrent({ ...current, productId: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.product_name} (Stock: {p.quantity_available})
              </option>
            ))}
          </select>
        </div>

        {/* QUANTITY */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            value={current.qty}
            onChange={(e) =>
              setCurrent({ ...current, qty: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* PRICE */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Selling Price (per unit)
          </label>
          <input
            type="number"
            value={current.price}
            onChange={(e) =>
              setCurrent({ ...current, price: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* PREVIEW */}
        {selectedProduct && current.qty && current.price && (
          <div className="bg-blue-50 p-4 rounded-xl text-sm">
            {selectedProduct.product_name} × {current.qty} = ₹
            {current.qty * current.price}
          </div>
        )}

        {/* ADD TO CART */}
        <button
          onClick={addToCart}
          className="w-full bg-gray-200 py-2 rounded-lg"
        >
          Add to Cart
        </button>

        {/* CART */}
        {cart.length > 0 && (
          <div className="border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold">Cart</h3>

            {cart.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <div className="flex gap-2">
                  <span>₹{item.total}</span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="font-semibold border-t pt-2">
              Total: ₹{cartTotal}
            </div>
          </div>
        )}

        {/* GENERATE BILL */}
        <button
          onClick={handleGenerate}
          disabled={cart.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50"
        >
          Generate Bill
        </button>

        {/* SUMMARY */}
        {summary && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="font-semibold mb-2">Bill Generated</h3>

            {summary.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {i.product_name} × {i.quantity}
                </span>
                <span>₹{i.total}</span>
              </div>
            ))}

            <div className="font-bold text-lg border-t pt-2">
              Grand Total: ₹{summary.grand_total}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

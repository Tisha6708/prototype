import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/common/PageWrapper";
import { api } from "../../services/api";

export default function CreateCampaign() {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const vendorId = Number(localStorage.getItem("userId"));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          vendor_id: vendorId,
          product_name: productName,
          description: description,
        }),
      });

      navigate("/vendor/home");
    } catch (err) {
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Create Campaign"
      subtitle="Describe the product you want influencers to promote"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-8 space-y-6 max-w-3xl"
      >
        {/* PRODUCT NAME */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            className="w-full border rounded-lg px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g. Wireless Headphones"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Campaign Description
          </label>
          <textarea
            rows={5}
            className="w-full border rounded-lg px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            placeholder="Describe what influencers should promote, key highlights, tone, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Upload Images
          </label>

          <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-400 transition">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer text-sm text-gray-600"
            >
              <span className="text-blue-600 font-medium">
                Click to upload
              </span>{" "}
              or drag & drop images
            </label>
          </div>
        </div>

        {/* IMAGE PREVIEW */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="border rounded-xl overflow-hidden"
              >
                <img
                  src={img.preview}
                  alt="preview"
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/vendor/home")}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Campaign"}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}

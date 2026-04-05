"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function AddProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    sku: "",
    images: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"manual" | "aliexpress">("manual");
  const [aliUrl, setAliUrl] = useState("");

  const addImage = () => {
    if (imageUrl) {
      setForm({ ...form, images: [...form.images, imageUrl] });
      setImageUrl("");
    }
  };

  const removeImage = (i: number) => {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        { ...form, storeId: id, price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : null, stock: Number(form.stock) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/stores/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const importAliexpress = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/aliexpress`,
        { storeId: id, aliexpressUrl: aliUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/stores/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to import product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">Add Product</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["manual", "aliexpress"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              {t === "aliexpress" ? "Import from AliExpress" : "Manual"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* AliExpress Import */}
        {tab === "aliexpress" && (
          <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-slate-400 text-sm">Paste an AliExpress product URL to import it automatically with AI-enhanced description.</p>
            <input
              type="url"
              value={aliUrl}
              onChange={(e) => setAliUrl(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="https://www.aliexpress.com/item/..."
            />
            <button
              onClick={importAliexpress}
              disabled={loading || !aliUrl}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Importing..." : "Import Product"}
            </button>
          </div>
        )}

        {/* Manual Form */}
        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1">Title <span className="text-red-400">*</span></label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder="Product title"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Leave empty for AI-generated description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">Price (₹) <span className="text-red-400">*</span></label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="499"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">Compare Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="SKU-001"
                />
              </div>
            </div>
            {/* Images */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1">Product Images</label>
              <div className="flex gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="Paste image URL"
                />
                <button type="button" onClick={addImage} className="bg-slate-600 hover:bg-slate-500 text-white px-4 rounded-lg transition">
                  Add
                </button>
              </div>
              {form.images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
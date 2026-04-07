"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CreateStorePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    niche: "",
    targetAudience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "generating">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStep("generating");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stores`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/stores/${data.id}`);
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.response?.data?.error || "Failed to create store";
      setError(apiError);
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6 animate-bounce">🤖</div>
          <h2 className="text-2xl font-bold mb-3">AI is building your store...</h2>
          <p className="text-slate-400">Generating store config, theme, and content</p>
          <div className="mt-8 flex justify-center gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-2 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Create Your Store</h1>
          <p className="text-slate-400 mt-2">Describe your business and AI will build everything</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-slate-300 font-medium block mb-2">
              Describe your business <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="e.g. I want to sell wireless earbuds and phone accessories targeting young professionals in India who love tech gadgets..."
            />
            <p className="text-slate-500 text-xs mt-1">Be as detailed as possible for better results</p>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-2">Niche (optional)</label>
            <input
              type="text"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Electronics, Fashion, Home Decor, Fitness..."
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-2">Target Audience (optional)</label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Young professionals, College students, Homemakers..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition text-lg"
          >
            🤖 Generate My Store
          </button>
        </form>
      </div>
    </div>
  );
}
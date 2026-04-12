"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#22c55e", "#6366f1"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[strength] }}>{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        form
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0f" }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #13101f 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[15%] right-[5%] w-[280px] h-[280px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />
          <div className="grid-bg absolute inset-0 opacity-30" />
        </div>

        <Link href="/" className="relative flex items-center gap-2 z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>M</div>
          <span className="text-white font-bold text-xl">Mali AI</span>
        </Link>

        <div className="relative z-10 space-y-6">
          {[
            { icon: "⚡", text: "Store ready in under 5 minutes" },
            { icon: "🤖", text: "AI writes all your product descriptions" },
            { icon: "💳", text: "Accept payments from day one" },
            { icon: "📱", text: "WhatsApp alerts for every order" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 glass">
                {item.icon}
              </div>
              <p className="text-gray-300 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">Trusted by entrepreneurs across India</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors mb-8">
              ← Back to home
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Start building your AI-powered store today</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6 animate-fade-in"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-red-400 mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mds-input"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mds-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-sm font-medium">Password</label>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mds-input"
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <PasswordStrength password={form.password} />
            </div>

            <button type="submit" disabled={loading} className="mds-button mds-button-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-gray-700 text-xs text-center mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
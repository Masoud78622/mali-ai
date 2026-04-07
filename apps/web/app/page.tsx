"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Store Builder",
    desc: "Describe your niche in plain English. Our AI creates your store name, tagline, product descriptions, and layout — instantly.",
    color: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/20",
  },
  {
    icon: "💳",
    title: "Razorpay Payments",
    desc: "Accept UPI, cards, and net banking out of the box. Your customers checkout seamlessly, you get paid instantly.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
  },
  {
    icon: "📱",
    title: "WhatsApp Order Alerts",
    desc: "Get notified on your WhatsApp the moment a customer places an order. Never miss a sale again.",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/20",
  },
  {
    icon: "🛍️",
    title: "AliExpress Integration",
    desc: "Import products directly from AliExpress with one click. AI writes better descriptions automatically.",
    color: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/20",
  },
  {
    icon: "⚡",
    title: "Instant Storefront",
    desc: "Your store gets a live URL the moment you create it. Share it anywhere — no technical setup needed.",
    color: "from-sky-500/20 to-blue-500/20",
    border: "border-sky-500/20",
  },
  {
    icon: "📊",
    title: "Orders Dashboard",
    desc: "Track every order, manage inventory, and monitor your sales — all in one clean dashboard.",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
  },
];

const steps = [
  { num: "01", title: "Describe Your Business", desc: "Tell us what you sell — a niche, a product category, anything." },
  { num: "02", title: "AI Builds Your Store", desc: "Our AI generates your store name, tagline, product lineup and storefront in seconds." },
  { num: "03", title: "Start Selling", desc: "Share your live store URL, accept payments, and get WhatsApp order notifications." },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#0a0a0f" }}>

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", animationDelay: "1.5s" }} />
        <div className="grid-bg absolute inset-0 opacity-40" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>M</div>
          <span className="text-white font-bold text-lg">Mali AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login"
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link href="/auth/register"
            className="text-sm text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.3)" }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 glass border"
            style={{ borderColor: "rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-powered dropshipping platform
          </div>
        </div>

        <h1 className={`text-5xl md:text-7xl font-black leading-tight mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-white">Build Your Store</span>
          <br />
          <span className="gradient-text">In Minutes, Not Months</span>
        </h1>

        <p className={`text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          Describe your business in plain English. Our AI builds your complete dropshipping store
          — with products, payments, and WhatsApp alerts — ready to share in seconds.
        </p>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link href="/auth/register"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 hover:-translate-y-1 glow-indigo"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            Start Building Free
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-gray-300 font-semibold text-lg transition-all duration-200 hover:text-white glass">
            Sign in
          </Link>
        </div>

        <p className={`mt-5 text-sm text-gray-600 transition-all duration-700 delay-400 ${mounted ? "opacity-100" : "opacity-0"}`}>
          No credit card required · Free forever plan available
        </p>
      </section>

      {/* Steps */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-16">Three steps to your live dropshipping store</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              <div className="text-5xl font-black mb-4 gradient-text-indigo opacity-30 group-hover:opacity-60 transition-opacity">
                {step.num}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(100%+16px)] w-8 text-gray-700 text-xl">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-white mb-4">Everything You Need</h2>
        <p className="text-center text-gray-400 mb-16">A complete platform to run your dropshipping business</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-opacity-40 bg-gradient-to-br cursor-default ${f.color} ${f.border}`}
              style={{ background: `linear-gradient(135deg, ${f.color.replace("from-", "").replace("/20", "").split(" ")[0]}10, transparent)` }}>
              <div className="text-3xl mb-4 transition-transform group-hover:scale-110 duration-200">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12" style={{ borderColor: "rgba(99,102,241,0.2)" }}>
          <div className="text-5xl mb-6 animate-bounce-subtle">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Your Store?</h2>
          <p className="text-gray-400 mb-8">Join hundreds of entrepreneurs building with Mali AI</p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 hover:-translate-y-1 glow-indigo"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            Create Your Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t text-center py-8 text-gray-600 text-sm" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p>© 2024 Mali AI. Built with ❤️ for entrepreneurs.</p>
      </footer>
    </main>
  );
}
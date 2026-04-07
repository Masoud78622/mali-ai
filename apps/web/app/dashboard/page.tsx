"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-3 w-48" />
        </div>
        <div className="skeleton h-5 w-12 ml-4 rounded-full" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-9 flex-1" />
        <div className="skeleton h-9 flex-1" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) { router.push("/auth/login"); return; }
    setUser(JSON.parse(userData || "{}"));
    fetchStores(token);
  }, []);

  const fetchStores = async (token: string) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stores`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores(data);
    } catch {
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.85)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>M</div>
            <span className="text-white font-bold text-lg">Mali AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/create"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.25)" }}>
              <span className="text-base">+</span> New Store
            </Link>

            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {initials}
                </div>
                <span className="hidden sm:block text-gray-400 text-sm">{user?.email}</span>
                <span className="text-gray-600 text-xs">{menuOpen ? "▲" : "▼"}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden animate-fade-in"
                  style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-white text-sm font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                  </div>
                  <button onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Your Stores
            </h1>
            <p className="text-gray-400 text-sm">
              {loading ? "Loading..." : stores.length === 0
                ? "No stores yet — create your first one"
                : `${stores.length} store${stores.length > 1 ? "s" : ""} total`}
            </p>
          </div>
          <Link href="/dashboard/create"
            className="sm:hidden flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white w-fit"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            + New Store
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl glass animate-float">
              🏪
            </div>
            <h2 className="text-white text-xl font-semibold mb-3">No stores yet</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              Create your first AI-powered dropshipping store in minutes
            </p>
            <Link href="/dashboard/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-medium transition-all hover:-translate-y-0.5 glow-indigo"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              Create Your First Store →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store: any, i: number) => {
                  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
                  const isInvalidDomain = !rootDomain || rootDomain === "undefined";
                  const fallbackDomain = typeof window !== "undefined" ? window.location.host : "localhost:3000";
                  const finalDomain = isInvalidDomain ? fallbackDomain : rootDomain;

                  return (
                    <div key={store.id}
                      className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        animationDelay: `${i * 0.05}s`,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
                      }}>
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)" }} />

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg truncate">{store.name}</h3>
                          <p className="text-gray-400 text-sm mt-0.5 truncate">{store.tagline}</p>
                        </div>
                        <span className={`ml-3 flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                          store.isLive
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-gray-500 bg-white/5 border border-white/10"
                        }`}>
                          {store.isLive ? "● Live" : "○ Draft"}
                        </span>
                      </div>

                      <div className="flex gap-4 text-xs text-gray-500 mb-5">
                        <span className="flex items-center gap-1">
                          <span>🛍️</span> {store._count?.products || 0} products
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📦</span> {store._count?.orders || 0} orders
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/stores/${store.id}`}
                          className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/10"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          Manage
                        </Link>
                        <a href={`http://${store.subdomain}.${finalDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-indigo-400 transition-all hover:text-indigo-300"
                          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                          View Store ↗
                        </a>
                      </div>
                    </div>
                  );
                })}

            {/* Create new store card */}
            <Link href="/dashboard/create"
              className="group rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ background: "rgba(99,102,241,0.03)", border: "1px dashed rgba(99,102,241,0.2)", minHeight: "200px" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all group-hover:scale-110"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                +
              </div>
              <p className="text-indigo-400 text-sm font-medium">Create New Store</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="mds-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-4 w-48 opacity-50" />
        </div>
        <div className="skeleton h-6 w-12 ml-4 rounded-full" />
      </div>
      <div className="flex gap-4 mb-6">
        <div className="skeleton h-4 w-20 opacity-30" />
        <div className="skeleton h-4 w-20 opacity-30" />
      </div>
      <div className="flex gap-3">
        <div className="skeleton h-10 flex-1" />
        <div className="skeleton h-10 flex-1" />
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>M</div>
            <span className="text-white font-bold text-xl tracking-tight">Mali AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/create"
              className="hidden sm:flex mds-button mds-button-primary">
              <span className="text-lg mr-1.5">+</span> New Store
            </Link>

            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {initials}
                </div>
                <span className="hidden sm:block text-slate-400 text-sm font-medium">{user?.email}</span>
                <span className="text-slate-600 text-[10px] ml-1">{menuOpen ? "▲" : "▼"}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 mds-card overflow-hidden animate-fade-in z-[60] p-1 bg-[#0f0f19]/95 backdrop-blur-2xl">
                  <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                    <p className="text-white text-sm font-semibold truncate">{user?.name || "User"}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{user?.email}</p>
                  </div>
                  <button onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg flex items-center gap-2">
                    <span>🚪</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="mb-2">Your Stores</h1>
            <p className="text-slate-500 font-medium">
              {loading ? "Discovering your business empire..." : stores.length === 0
                ? "No stores yet — create your first one"
                : `${stores.length} store${stores.length > 1 ? "s" : ""} active and ready`}
            </p>
          </div>
          <Link href="/dashboard/create"
            className="sm:hidden mds-button mds-button-primary w-full">
            + New Store
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-white/[0.05] rounded-[2.5rem] bg-white/[0.01]">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-5xl bg-white/[0.03] border border-white/[0.06] shadow-mds-low animate-float">
              🏪
            </div>
            <h2 className="mb-4">No stores yet</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
              Launch your first AI-powered dropshipping business in under 60 seconds.
            </p>
            <Link href="/dashboard/create"
              className="mds-button mds-button-primary px-10 py-4 text-base">
              Create Your First Store <span className="ml-2">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store: any, i: number) => {
                  const envDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
                  let finalDomain = "mali-ai.shop";
                  if (envDomain && envDomain !== "undefined" && envDomain !== "") {
                    finalDomain = envDomain;
                  } else if (typeof window !== "undefined") {
                    const host = window.location.host;
                    if (host.includes("localhost")) {
                      finalDomain = host;
                    } else {
                      finalDomain = host.replace("www.", "");
                    }
                  }
                  finalDomain = finalDomain.replace("www.", "");

                  return (
                    <div key={store.id}
                      className="group mds-card p-6 animate-fade-up"
                      style={{ animationDelay: `${i * 0.05}s` }}>
                      
                      {/* Inner highlight (MDS) */}
                      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/[0.03] shadow-inner" />

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-white font-bold text-lg truncate mb-1">{store.name}</h3>
                          <p className="text-slate-500 text-sm truncate font-medium">{store.tagline}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border shadow-sm ${
                          store.isLive
                            ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
                            : "text-slate-500 bg-white/5 border-white/10"
                        }`}>
                          {store.isLive ? "● Live" : "○ Draft"}
                        </span>
                      </div>

                      <div className="flex gap-6 text-[11px] font-bold text-slate-400 mb-8 relative z-10">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03]">
                          <span className="opacity-70 text-base">🛍️</span> {store._count?.products || 0} Products
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03]">
                          <span className="opacity-70 text-base">📦</span> {store._count?.orders || 0} Orders
                        </span>
                      </div>

                      <div className="flex gap-3 relative z-10">
                        <Link href={`/dashboard/stores/${store.id}`}
                          className="flex-1 mds-button mds-button-secondary text-sm">
                          Manage
                        </Link>
                        <a href={`http://${store.subdomain}.${finalDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 mds-button mds-button-secondary text-sm group/btn"
                          style={{ background: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                          View <span className="ml-1.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })}

            {/* Create new store card */}
            <Link href="/dashboard/create"
              className="group mds-card p-6 flex flex-col items-center justify-center gap-4 border-dashed border-white/[0.06] bg-white/[0.01] min-h-[220px] shadow-none hover:bg-white/[0.02]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:scale-110 bg-white/[0.03] border border-white/[0.06] text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30">
                +
              </div>
              <p className="text-slate-400 font-bold group-hover:text-indigo-400 transition-colors">Create Another Store</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Mali AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user?.email}</span>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Stores</h2>
            <p className="text-slate-400 mt-1">Manage your AI-powered dropshipping stores</p>
          </div>
          <Link
            href="/dashboard/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + Create Store
          </Link>
        </div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-white text-xl font-semibold mb-2">No stores yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI-powered store in minutes</p>
            <Link
              href="/dashboard/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-500 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{store.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{store.tagline}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${store.isLive ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"}`}>
                    {store.isLive ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-slate-400 mb-4">
                  <span>🛍️ {store._count?.products || 0} products</span>
                  <span>📦 {store._count?.orders || 0} orders</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/stores/${store.id}`}
                    className="flex-1 text-center bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition"
                  >
                    Manage
                  </Link>
                  
                    href={`http://${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                    target="_blank"
                    className="flex-1 text-center bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 py-2 rounded-lg text-sm transition"
                  >
                    View Store
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
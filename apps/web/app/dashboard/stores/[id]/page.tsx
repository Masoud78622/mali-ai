"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function StorePage() {
  const router = useRouter();
  const { id } = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "orders" | "settings">("products");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    fetchAll(token);
  }, [id]);

  useEffect(() => {
    if (store?.config) {
      setUpiId(store.config.upiId || "");
      setUpiName(store.config.upiName || "");
    }
  }, [store]);

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedConfig = { ...store.config, upiId, upiName };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/${id}`, { config: updatedConfig }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Settings saved successfully!");
      fetchAll(token!);
    } catch (err) {
      alert("Failed to save settings.");
    }
  };

  const fetchAll = async (token: string) => {
    try {
      const [storeRes, productRes, orderRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/store/${id}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/store/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStore(storeRes.data);
      setProducts(productRes.data);
      setOrders(orderRes.data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (productId: string) => {
    const token = localStorage.getItem("token");
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll(token!);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll(token!);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition">← Dashboard</Link>
          <h1 className="text-white font-bold text-xl">{store?.name}</h1>
        </div>
          {store && (() => {
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
              <a
                href={`http://${store.subdomain}.${finalDomain}`}
                target="_blank"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                View Store
              </a>
            );
          })()}
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Products", value: products.length, icon: "🛍️" },
            { label: "Orders", value: orders.length, icon: "📦" },
            { label: "Revenue", value: `₹${orders.filter(o => o.status === "PAID").reduce((s: number, o: any) => s + Number(o.total), 0).toFixed(0)}`, icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["products", "orders", "settings"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
          {tab === "products" && (
            <Link
              href={`/dashboard/stores/${id}/products/add`}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add Product
            </Link>
          )}
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📦</div>
                <p>No products yet. Add your first product.</p>
              </div>
            ) : products.map((p) => (
              <div key={p.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-16 h-16 rounded-lg object-cover" />}
                <div className="flex-1">
                  <h3 className="text-white font-medium">{p.title}</h3>
                  <p className="text-slate-400 text-sm">₹{Number(p.price).toFixed(2)} • Stock: {p.stock}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                  <button onClick={() => toggleProduct(p.id)} className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-700 rounded-lg transition">
                    Toggle
                  </button>
                  <Link href={`/dashboard/stores/${id}/products/${p.id}/edit`} className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-700 rounded-lg transition">
                    Edit
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📬</div>
                <p>No orders yet.</p>
              </div>
            ) : orders.map((o) => {
              const confirmPayment = async (orderId: string) => {
                if (!confirm("Is payment confirmed via UPI?")) return;
                const token = localStorage.getItem("token");
                await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, { status: "PAID" }, { headers: { Authorization: `Bearer ${token}` } });
                fetchAll(token!);
              };

              return (
                <div key={o.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-medium">{o.customerName}</span>
                      <span className="text-slate-400 text-sm ml-2">{o.customerEmail}</span>
                      {o.customerPhone && <span className="text-slate-500 text-xs ml-2">({o.customerPhone})</span>}
                      
                      {/* Address and UPI ID display limit */}
                      <div className="mt-2 text-xs">
                        <p className="text-slate-500 max-w-sm truncate" title={typeof o.customerAddress === 'object' ? o.customerAddress?.address : o.customerAddress}>
                          📍 {typeof o.customerAddress === 'object' ? o.customerAddress?.address || o.customerAddress?.street : o.customerAddress}
                        </p>
                        {(typeof o.customerAddress === 'object' && o.customerAddress?.upiId) && (
                          <p className="text-indigo-400 font-medium mt-1">
                            💳 Paid from UPI: {o.customerAddress.upiId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">₹{Number(o.total).toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        o.status === "PAID" ? "bg-green-500/20 text-green-400" :
                        o.status === "PENDING" ? "bg-amber-500/20 text-amber-400" :
                        "bg-slate-600 text-slate-400"
                      }`}>{o.status}</span>
                      {o.status === "PENDING" && (
                        <button 
                          onClick={() => confirmPayment(o.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase font-bold px-3 py-1 rounded transition"
                        >
                          Confirm Payment ✓
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Store Payment Settings</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-slate-400 text-sm mb-2">UPI ID (VPA)</label>
                <input 
                  type="text" 
                  value={upiId} 
                  onChange={(e) => setUpiId(e.target.value)} 
                  placeholder="e.g. masud@okaxis"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                />
                <p className="text-slate-500 text-xs mt-1">Shoppers will pay directly to this ID via QR code.</p>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={upiName} 
                  onChange={(e) => setUpiName(e.target.value)} 
                  placeholder="e.g. Shaikh Masud"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={saveSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition"
            >
              Save Payment Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}